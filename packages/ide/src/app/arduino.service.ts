import { Injectable, NgZone, inject } from "@angular/core";
import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { Subject } from "rxjs";

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
  serialPort: string | null = null;

  readonly isAvailable = isTauri();
  readonly output$ = new Subject<string>();
  readonly serialOutput$ = new Subject<string>();

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
    this.listenerInit ??= this.openListeners().catch(error => {
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

    this.unlisteners = await Promise.all([
      ...events.map(eventName =>
        listen<string>(eventName, event => {
          this.ngZone.run(() => {
            this.output$.next(event.payload);
          });
        }),
      ),
      listen<{ port: string; data: number[] }>("serial-data", event => {
        if (event.payload.port !== this.serialPort) return;
        const text = this.serialDecoder.decode(new Uint8Array(event.payload.data), { stream: true });
        this.ngZone.run(() => this.serialOutput$.next(text));
      }),
      listen<[string, string]>("serial-disconnected", event => {
        if (event.payload[0] !== this.serialPort) return;
        this.ngZone.run(() => {
          this.serialPort = null;
          this.serialOutput$.next(`\nMonitor serial desconectado: ${event.payload[1]}\n`);
        });
      }),
    ]);
    if (this.listenerCount === 0) this.closeListeners();
  }

  destroyListeners() {
    this.listenerCount = Math.max(0, this.listenerCount - 1);
    if (this.listenerCount > 0) return;
    if (this.serialPort) void this.stopSerialMonitor().catch(console.error);
    this.closeListeners();
  }

  private closeListeners() {
    for (const unlisten of this.unlisteners) {
      unlisten();
    }

    this.unlisteners = [];
    this.listenerInit = undefined;
  }

  async startSerialMonitor(port: string) {
    await this.ensureListeners();
    if (this.listenerCount === 0) throw new Error("Abra uma aba do editor para usar o monitor serial.");
    this.serialDecoder = new TextDecoder();
    this.serialPort = port;
    try {
      await this.invokeDesktop<void>("start_serial_monitor", { port });
      if (this.listenerCount === 0) await this.stopSerialMonitor();
    } catch (error) {
      this.serialPort = null;
      throw error;
    }
  }

  async stopSerialMonitor() {
    await this.invokeDesktop<void>("stop_serial_monitor");
    this.serialPort = null;
    this.serialDecoder = new TextDecoder();
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
    const previousPort = this.serialPort;
    if (previousPort) await this.stopSerialMonitor();
    let uploaded = false;
    try {
      const result = await this.invokeDesktop<string>("compile_and_upload", { sketchCode, port, boardId });
      uploaded = true;
      return result;
    } finally {
      const resumePort = uploaded ? port : previousPort;
      if (resumePort && this.listenerCount > 0) {
        try {
          await this.startSerialMonitor(resumePort);
          this.output$.next(`\nMonitor serial conectado a ${resumePort} — 9600 baud.\n`);
        } catch (error) {
          this.output$.next(`\nNão foi possível abrir o monitor serial: ${String(error)}\n`);
        }
      }
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
