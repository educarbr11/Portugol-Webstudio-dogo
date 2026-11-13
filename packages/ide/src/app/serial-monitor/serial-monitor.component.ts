import { AfterViewChecked, Component, ElementRef, OnDestroy, inject, input, viewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ArduinoService } from "../arduino.service";

@Component({
  selector: "app-serial-monitor",
  imports: [FormsModule],
  templateUrl: "./serial-monitor.component.html",
  styleUrl: "./serial-monitor.component.scss",
})
export class SerialMonitorComponent implements AfterViewChecked, OnDestroy {
  readonly arduino = inject(ArduinoService);
  readonly port = input("");
  readonly disabled = input(false);
  readonly visible = input(false);
  readonly content = viewChild<ElementRef<HTMLElement>>("content");
  autoScroll = true;
  text = "";
  private scrollPending = true;
  private subscription = this.arduino.serialOutput$.subscribe(text => {
    this.text = text;
    this.scrollPending = true;
  });

  async toggleConnection() {
    try {
      if (this.arduino.serialPort) await this.arduino.stopSerialMonitor();
      else if (this.port()) await this.arduino.startSerialMonitor(this.port());
    } catch (error) {
      this.arduino.serialStatus = String(error);
    }
  }

  scrollToEnd() {
    this.scrollPending = true;
  }

  ngAfterViewChecked() {
    const element = this.content()?.nativeElement;
    if (this.scrollPending && this.autoScroll && this.visible() && element) {
      element.scrollTop = element.scrollHeight;
      this.scrollPending = false;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
