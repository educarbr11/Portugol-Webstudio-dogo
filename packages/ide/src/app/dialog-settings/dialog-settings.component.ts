import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDialogClose, MatDialogContent, MatDialogTitle } from "@angular/material/dialog";
import { AngularSvgIconModule } from "angular-svg-icon";
import { LocalStorage } from "ngx-webstorage";
import { defaultFontSize } from "../../settings";

@Component({
  selector: "app-dialog-settings",
  imports: [FormsModule, MatDialogClose, MatDialogContent, MatDialogTitle, AngularSvgIconModule],
  standalone: true,
  templateUrl: "./dialog-settings.component.html",
  styleUrl: "./dialog-settings.component.scss",
})
export class DialogSettingsComponent {
  @LocalStorage("theme", "auto")
  theme!: "light" | "dark" | "auto";

  @LocalStorage("editorFontSize", defaultFontSize)
  editorFontSize!: number;

  @LocalStorage("editorWordWrap", false)
  editorWordWrap!: boolean;

  resetDefaults() {
    this.theme = "auto";
    this.editorFontSize = defaultFontSize;
    this.editorWordWrap = false;
  }
}
