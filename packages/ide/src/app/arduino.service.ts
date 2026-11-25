import { Injectable, NgZone, inject } from "@angular/core";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { BehaviorSubject, Subject } from "rxjs";

interface SerialBatch {
  data: number[];
  dropped: number;
  error: string | null;
}

const MAX_SERIAL_TEXT = 32_768;
const SERIAL_POLL_MS = 50;

export interface ArduinoPort {
  name: string;
  port_type: string;
}

export interface ArduinoSetupStatus {
  board_id: string;
  board_label: string;
  core_installed: boolean;
  missing_libraries: string[];
  ready: boolean;
}

export interface ArduinoBoard {
  id: string;
  label: string;
}

export interface UsbDriverDevice {
  driver_id: string;
  label: string;
  device_name: string;
  instance_id: string;
  needs_driver: boolean;
  problem_code: number;
}

export interface UsbDriverStatus {
  supported: boolean;
  devices: UsbDriverDevice[];
  message: string;
}

@Injectable({ providedIn: "root" })
export class ArduinoService {
  private ngZone = inject(NgZone);
  private unlisteners: UnlistenFn[] = [];
  private attemptedDrivers = new Set<string>();
  private usbDriverOperation?: Promise<UsbDriverStatus>;
  private listenerCount = 0;
  private listenerInit?: Promise<void>;
  private serialDecoder = new TextDecoder();
  private serialSession: number | null = null;
  private serialTimer?: ReturnType<typeof setTimeout>;
  private serialGeneration = 0;
  serialBusy = false;
  boardBusy = false;
  serialPort: string | null = null;
  serialBaudRate = 9600;
  serialStatus = "Desconectado";
  serialWarning = "";
  readonly baudRates = [1200, 2400, 4800, 9600, 19_200, 38_400, 57_600, 115_200];

  readonly isAvailable = isTauri();
  readonly output$ = new Subject<string>();
  readonly serialOutput$ = new BehaviorSubject<string>("");

  readonly boards: ArduinoBoard[] = [
    { id: "arduino_uno", label: "Arduino Uno" },
    { id: "esp32_dev_module", label: "ESP32 Dev Module" },
  ];

  async initListeners() {
    if (!this.isAvailable) return;
    this.listenerCount++;
    await this.ensureListeners();
  }

  private ensureListeners() {
    this.listenerInit ??= this.openListeners().catch((error: unknown) => {
      this.listenerInit = undefined;
      throw error;
    });
    return this.listenerInit;
  }

  private async openListeners() {
    const events = [
      "setup-progress",
      "compile-output",
      "compile-error",
      "upload-started",
      "upload-output",
      "upload-progress",
    ];

    this.unlisteners = await Promise.all(
      events.map(eventName =>
        listen<string>(eventName, event => {
          this.ngZone.run(() => {
            this.output$.next(event.payload);
          });
        }),
      ),
    );
    if (this.listenerCount === 0) this.closeListeners();
  }

  destroyListeners() {
    this.listenerCount = Math.max(0, this.listenerCount - 1);
    if (this.listenerCount > 0) return;
    this.cancelSerialPolling();
    if (this.serialPort && !this.boardBusy && !this.serialBusy) void this.stopSerialMonitor().catch(console.error);
    this.closeListeners();
  }

  private closeListeners() {
    for (const unlisten of this.unlisteners) {
      unlisten();
    }

    this.unlisteners = [];
    this.listenerInit = undefined;
  }

  async startSerialMonitor(port: string, baudRate = this.serialBaudRate) {
    if (this.boardBusy || this.serialBusy) throw new Error("Aguarde a operação atual da placa terminar.");
    this.serialBusy = true;
    try {
      await this.openSerialMonitor(port, baudRate);
    } finally {
      this.serialBusy = false;
    }
  }

  private async openSerialMonitor(port: string, baudRate: number) {
    await this.ensureListeners();
    if (this.listenerCount === 0) throw new Error("Abra uma aba do editor para usar o monitor serial.");
    this.cancelSerialPolling();
    const generation = this.serialGeneration;
    this.serialDecoder = new TextDecoder();
    this.serialStatus = "Conectando…";
    this.serialWarning = "";
    try {
      const session = await this.invokeDesktop<number>("start_serial_monitor", { port, baudRate });
      if (this.listenerCount === 0 || generation !== this.serialGeneration) {
        await this.invokeDesktop<unknown>("stop_serial_monitor");
        this.serialPort = null;
        this.serialStatus = "Desconectado";
        return;
      }
      this.serialSession = session;
      this.serialPort = port;
      this.serialBaudRate = baudRate;
      this.serialStatus = `Conectado a ${port} — ${baudRate} baud`;
      this.scheduleSerialRead(generation);
    } catch (error) {
      this.serialPort = null;
      this.serialStatus = `Não foi possível conectar: ${String(error)}`;
      throw error;
    }
  }

  async stopSerialMonitor() {
    if (this.boardBusy || this.serialBusy) throw new Error("Aguarde a operação atual da placa terminar.");
    this.serialBusy = true;
    try {
      await this.closeSerialMonitor();
    } finally {
      this.serialBusy = false;
    }
  }

  private async closeSerialMonitor() {
    this.cancelSerialPolling();
    await this.invokeDesktop<unknown>("stop_serial_monitor");
    this.serialPort = null;
    this.serialDecoder = new TextDecoder();
    this.serialStatus = "Desconectado";
  }

  clearSerialOutput() {
    this.serialOutput$.next("");
    this.serialWarning = "";
  }

  private cancelSerialPolling() {
    this.serialGeneration++;
    this.serialSession = null;
    clearTimeout(this.serialTimer);
    this.serialTimer = undefined;
  }

  private scheduleSerialRead(generation: number) {
    this.ngZone.runOutsideAngular(() => {
      this.serialTimer = setTimeout(() => {
        void this.readSerialBatch(generation);
      }, SERIAL_POLL_MS);
    });
  }

  private async readSerialBatch(generation: number) {
    const sessionId = this.serialSession;
    if (generation !== this.serialGeneration || sessionId === null) return;
    try {
      const batch = await this.invokeDesktop<SerialBatch>("read_serial_monitor", { sessionId });
      if (generation !== this.serialGeneration) return;
      if (batch.dropped) this.serialDecoder = new TextDecoder();
      const text = this.serialDecoder.decode(new Uint8Array(batch.data), { stream: true });
      if (text || batch.dropped || batch.error) {
        this.ngZone.run(() => {
          if (batch.dropped)
            this.serialWarning =
              "Recepção intensa: parte do histórico foi descartada para manter a interface responsiva.";
          if (text.includes("\uFFFD"))
            this.serialWarning =
              "Dados ilegíveis: confira o baud. O código gerado usa 9600; o boot do ESP32 usa 115200.";
          if (text) this.serialOutput$.next((this.serialOutput$.value + text).slice(-MAX_SERIAL_TEXT));
          if (batch.error) this.serialDisconnected(batch.error);
        });
      }
      // Schedule after completion: a slow/hidden webview never queues more reads.
      if (generation === this.serialGeneration) this.scheduleSerialRead(generation);
    } catch (error) {
      if (generation === this.serialGeneration) {
        this.ngZone.run(() => {
          this.serialDisconnected(String(error));
        });
      }
    }
  }

  private serialDisconnected(error: string) {
    this.cancelSerialPolling();
    this.serialPort = null;
    this.serialStatus = `Desconectado: ${error}. Atualize as portas e conecte novamente.`;
  }

  readPorts() {
    return this.invokeDesktop<ArduinoPort[]>("read_ports");
  }

  prepareUsbDrivers(retry = false) {
    this.usbDriverOperation ??= this.prepareUsbDriversOnce(retry).finally(() => {
      this.usbDriverOperation = undefined;
    });

    return this.usbDriverOperation;
  }

  private async prepareUsbDriversOnce(retry: boolean) {
    const status = await this.invokeDesktop<UsbDriverStatus>("check_usb_drivers");
    const missing = new Map(
      status.devices.filter(device => device.needs_driver).map(device => [device.driver_id, device]),
    );
    let installed = false;

    for (const [driverId, device] of missing) {
      if (this.attemptedDrivers.has(driverId) && !retry) {
        continue;
      }

      this.attemptedDrivers.add(driverId);
      this.output$.next(`Driver ${device.label} ausente. Preparando instalação; confirme a autorização do Windows.\n`);

      try {
        const result = await this.invokeDesktop<string>("install_usb_driver", { driverId });
        this.output$.next(`${result}\n`);
        installed = true;
      } catch (error) {
        this.output$.next(`Não foi possível concluir a instalação do driver ${device.label}:\n${String(error)}\n`);
        this.output$.next("Use o botão Driver USB para tentar novamente.\n");
      }
    }

    return installed ? this.invokeDesktop<UsbDriverStatus>("check_usb_drivers") : status;
  }

  checkSetup(boardId: string) {
    return this.invokeDesktop<ArduinoSetupStatus>("check_arduino_setup", { boardId });
  }

  initializeSetup(boardId: string) {
    return this.invokeDesktop<string>("initialize_arduino_setup", { boardId });
  }

  async compileAndUpload(sketchCode: string, port: string, boardId: string) {
    if (this.boardBusy || this.serialBusy) throw new Error("Aguarde a operação atual da placa terminar.");
    this.boardBusy = true;
    const previousPort = this.serialPort;
    const previousBaudRate = this.serialBaudRate;
    let uploaded = false;
    try {
      if (previousPort) await this.closeSerialMonitor();
      this.serialStatus = "Pausado durante o envio…";
      const result = await this.invokeDesktop<string>("compile_and_upload", { sketchCode, port, boardId });
      uploaded = true;
      return result;
    } finally {
      const resumePort = uploaded ? port : previousPort;
      if (resumePort && this.listenerCount > 0) {
        try {
          // Generated sketches always initialize Serial at 9600, even after boot diagnostics.
          await this.openSerialMonitor(resumePort, uploaded ? 9600 : previousBaudRate);
          this.output$.next(
            `\nMonitor serial conectado a ${resumePort} — ${this.serialBaudRate} baud. Veja a aba Monitor serial.\n`,
          );
        } catch (error) {
          this.output$.next(`\nNão foi possível abrir o monitor serial: ${String(error)}\n`);
        }
      } else {
        this.serialStatus = "Desconectado";
      }
      this.boardBusy = false;
    }
  }

  checkPortStatus(port: string) {
    return this.invokeDesktop<string>("check_port_status", { port });
  }

  resetArduino(port: string) {
    return this.invokeDesktop<string>("reset_arduino", { port });
  }

  private invokeDesktop<T>(command: string, args?: Record<string, unknown>) {
    if (!this.isAvailable) {
      return Promise.reject(new Error("A integração com Arduino está disponível apenas no aplicativo desktop."));
    }

    return invoke<T>(command, args);
  }
}
