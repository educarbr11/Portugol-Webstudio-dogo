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

  readonly isAvailable = isTauri();
  readonly output$ = new Subject<string>();

  readonly boards: ArduinoBoard[] = [
    { id: "arduino_uno", label: "Arduino Uno" },
    { id: "esp32_dev_module", label: "ESP32 Dev Module" },
  ];

  async initListeners() {
    if (!this.isAvailable || this.unlisteners.length > 0) {
      return;
    }

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
  }

  destroyListeners() {
    for (const unlisten of this.unlisteners) {
      unlisten();
    }

    this.unlisteners = [];
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

  compileAndUpload(sketchCode: string, port: string, boardId: string) {
    return this.invokeDesktop<string>("compile_and_upload", { sketchCode, port, boardId });
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
