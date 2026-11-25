import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ideDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ideRequire = createRequire(path.join(ideDir, "src/app/app.module.ts"));
const monacoEntry = ideRequire.resolve("@materia-ui/ngx-monaco-editor");
const monacoRequire = createRequire(monacoEntry);

function resolveSharedPackage(name) {
  return {
    ide: fs.realpathSync(ideRequire.resolve(name)),
    monaco: fs.realpathSync(monacoRequire.resolve(name)),
  };
}

const forms = resolveSharedPackage("@angular/forms");
const core = resolveSharedPackage("@angular/core");

await import(pathToFileURL(ideRequire.resolve("@angular/compiler")).href);
const [ideForms, monacoForms] = await Promise.all([
  import(pathToFileURL(forms.ide).href),
  import(pathToFileURL(forms.monaco).href),
]);

const duplicateFormsMessage =
  "A IDE e o Monaco precisam compartilhar @angular/forms para registrar o mesmo NG_VALUE_ACCESSOR. " +
  `IDE: ${forms.ide}; Monaco: ${forms.monaco}`;

assert.equal(ideForms.NG_VALUE_ACCESSOR, monacoForms.NG_VALUE_ACCESSOR, duplicateFormsMessage);
assert.equal(ideForms.NG_VALIDATORS, monacoForms.NG_VALIDATORS, duplicateFormsMessage);
assert.equal(ideForms.NgModel, monacoForms.NgModel, duplicateFormsMessage);
assert.equal(forms.ide, forms.monaco, duplicateFormsMessage);
assert.equal(core.ide, core.monaco, "A IDE e o Monaco precisam compartilhar a mesma instalação de @angular/core.");

const { MonacoEditorComponent } = await import(pathToFileURL(monacoEntry).href);
for (const method of ["writeValue", "registerOnChange", "registerOnTouched"]) {
  assert.equal(typeof MonacoEditorComponent.prototype[method], "function", `Monaco sem ${method}.`);
}

console.log("ok Angular Forms: IDE e Monaco compartilham NG_VALUE_ACCESSOR, NgModel e a mesma instalação de Angular");
console.log("ok Monaco: implementação de ControlValueAccessor disponível");
