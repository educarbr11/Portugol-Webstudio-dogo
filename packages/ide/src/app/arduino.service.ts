import { Injectable, NgZone, inject } from "@angular/core";
import { invoke } from "@tauri-apps/api/core";
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

@Injectable({ providedIn: "root" })
export class ArduinoService {
  private ngZone = inject(NgZone);
  private unlisteners: UnlistenFn[] = [];

  readonly output$ = new Subject<string>();

  readonly boards: ArduinoBoard[] = [
    { id: "arduino_uno", label: "Arduino Uno" },
    { id: "esp32_dev_module", label: "ESP32 Dev Module" },
  ];

  async initListeners() {
    if (this.unlisteners.length > 0) {
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
    return invoke<ArduinoPort[]>("read_ports");
  }

  checkSetup(boardId: string) {
    return invoke<ArduinoSetupStatus>("check_arduino_setup", { boardId });
  }

  initializeSetup(boardId: string) {
    return invoke<string>("initialize_arduino_setup", { boardId });
  }

  compileAndUpload(sketchCode: string, port: string, boardId: string) {
    return invoke<string>("compile_and_upload", { sketchCode, port, boardId });
  }

  checkPortStatus(port: string) {
    return invoke<string>("check_port_status", { port });
  }

  resetArduino(port: string) {
    return invoke<string>("reset_arduino", { port });
  }
}
