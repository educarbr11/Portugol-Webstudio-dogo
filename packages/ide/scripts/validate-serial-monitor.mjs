import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/app");
const require = createRequire(path.join(appDir, "arduino.service.ts"));
await import(pathToFileURL(require.resolve("@angular/compiler")).href);
const core = await import(pathToFileURL(require.resolve("@angular/core")).href);
const source = fs.readFileSync(path.join(appDir, "arduino.service.ts"), "utf8");
const compiled = ts
  .transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
  })
  .outputText.replace(
    /from "([^"]+)"/gu,
    (_, name) => `from ${JSON.stringify(pathToFileURL(require.resolve(name)).href)}`,
  );
const { ArduinoService } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);
const injector = core.createEnvironmentInjector(
  [{ provide: core.NgZone, useValue: { run: fn => fn() } }],
  core.Injector.NULL,
);
try {
  for (const [uploadFails, monitorFails] of [
    [false, false],
    [true, false],
    [false, true],
  ]) {
    const service = core.runInInjectionContext(injector, () => new ArduinoService());
    const calls = [];
    service.serialPort = "COM3";
    service.listenerCount = 1;
    service.ensureListeners = async () => {};
    service.invokeDesktop = async command => {
      calls.push(command);
      if (command === "compile_and_upload" && uploadFails) throw new Error("compile failed");
      if (command === "start_serial_monitor" && monitorFails) throw new Error("port busy");
      return "uploaded";
    };
    if (uploadFails) await assert.rejects(service.compileAndUpload("code", "COM3", "esp32_dev_module"));
    else assert.equal(await service.compileAndUpload("code", "COM3", "esp32_dev_module"), "uploaded");
    assert.deepEqual(calls, ["stop_serial_monitor", "compile_and_upload", "start_serial_monitor"]);
    assert.equal(service.serialPort, monitorFails ? null : "COM3");
  }
  console.log("ok monitor: pausa antes do upload, retoma depois e separa falha de leitura de envio bem-sucedido");
} finally {
  injector.destroy();
}
