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
  [{ provide: core.NgZone, useValue: { run: fn => fn(), runOutsideAngular: fn => fn() } }],
  core.Injector.NULL,
);
function createService(transport) {
  const service = core.runInInjectionContext(injector, () => new ArduinoService());
  service.listenerCount = 1;
  service.ensureListeners = async () => {};
  service.invokeDesktop = transport;
  service.scheduleSerialRead = generation => {
    service.testGeneration = generation;
  };
  return service;
}
const bytes = text => [...new TextEncoder().encode(text)];
const batch = (text = "", extra = {}) => ({ data: bytes(text), dropped: 0, error: null, ...extra });
try {
  for (const [uploadFails, monitorFails] of [
    [false, false],
    [true, false],
    [false, true],
  ]) {
    const calls = [];
    const service = createService(async (command, args) => {
      calls.push([command, args]);
      if (command === "compile_and_upload" && uploadFails) throw new Error("compile failed");
      if (command === "start_serial_monitor" && monitorFails) throw new Error("port busy");
      return command === "start_serial_monitor" ? 7 : "uploaded";
    });
    service.serialPort = "COM3";
    service.serialBaudRate = 115200;
    if (uploadFails) await assert.rejects(service.compileAndUpload("code", "COM3", "esp32_dev_module"));
    else assert.equal(await service.compileAndUpload("code", "COM3", "esp32_dev_module"), "uploaded");
    assert.deepEqual(
      calls.map(([command]) => command),
      ["stop_serial_monitor", "compile_and_upload", "start_serial_monitor"],
    );
    assert.equal(calls[2][1].baudRate, uploadFails ? 115200 : 9600);
    assert.equal(service.serialPort, monitorFails ? null : "COM3");
    assert.equal(service.boardBusy, false);
  }
  console.log("ok upload: libera porta antes, retoma no baud correto e preserva resultado de gravação");

  let response = batch();
  const service = createService(async command => (command === "read_serial_monitor" ? response : 7));
  await service.startSerialMonitor("/dev/ttyUSB0", 9600);
  const read = () => service.readSerialBatch(service.testGeneration);
  const encoded = bytes("Toque: ação 15\r\n");
  const split = encoded.indexOf(0xc3) + 1;
  response = batch("", { data: encoded.slice(0, split) });
  await read();
  response = batch("", { data: encoded.slice(split) });
  await read();
  assert.equal(service.serialOutput$.value, "Toque: ação 15\r\n");
  let renders = 0;
  const subscription = service.serialOutput$.subscribe(() => renders++);
  for (let i = 0; i < 1000; i++) {
    response = batch("Toque: 15\n".repeat(100));
    await read();
  }
  assert.equal(renders, 1001);
  assert.equal(service.serialOutput$.value.length, 32768);
  assert.ok(service.serialOutput$.value.endsWith("Toque: 15\n"));
  response = batch("", { data: [255], dropped: 80 });
  await read();
  assert.match(service.serialWarning, /baud/);
  response = batch("Toque: 60\n", { error: "unplugged" });
  await read();
  assert.equal(service.serialPort, null);
  assert.match(service.serialStatus, /unplugged/);
  assert.ok(service.serialOutput$.value.endsWith("Toque: 60\n"));
  service.clearSerialOutput();
  assert.equal(service.serialOutput$.value, "");
  subscription.unsubscribe();
  console.log("ok recepção: UTF-8 fragmentado, 1 MB de tráfego, histórico limitado, alerta de baud e desconexão");

  let finishRead;
  const late = createService(async command =>
    command === "read_serial_monitor"
      ? new Promise(resolve => {
          finishRead = resolve;
        })
      : 8,
  );
  await late.startSerialMonitor("COM4");
  const pending = late.readSerialBatch(late.testGeneration);
  await late.stopSerialMonitor();
  finishRead(batch("resultado antigo"));
  await pending;
  assert.equal(late.serialOutput$.value, "");
  assert.equal(late.serialPort, null);
  console.log("ok cancelamento: resposta atrasada não escreve após parar o monitor");

  let finishUpload;
  const busy = createService(async command =>
    command === "compile_and_upload"
      ? new Promise(resolve => {
          finishUpload = resolve;
        })
      : 9,
  );
  const uploading = busy.compileAndUpload("code", "COM5", "esp32_dev_module");
  await assert.rejects(busy.startSerialMonitor("COM5"), /Aguarde/);
  await assert.rejects(busy.compileAndUpload("code", "COM5", "esp32_dev_module"), /Aguarde/);
  busy.listenerCount = 0;
  finishUpload("uploaded");
  await uploading;
  assert.equal(busy.serialPort, null);
  assert.equal(busy.boardBusy, false);

  let finishOpen;
  const calls = [];
  const closing = createService(async command => {
    calls.push(command);
    return command === "start_serial_monitor"
      ? new Promise(resolve => {
          finishOpen = resolve;
        })
      : undefined;
  });
  const opening = closing.startSerialMonitor("COM6");
  await Promise.resolve();
  closing.listenerCount = 0;
  closing.cancelSerialPolling();
  finishOpen(10);
  await opening;
  assert.deepEqual(calls, ["start_serial_monitor", "stop_serial_monitor"]);
  assert.equal(closing.serialPort, null);
  console.log("ok ciclo de vida: bloqueia operações simultâneas e não reabre porta após fechar o editor");
} finally {
  injector.destroy();
}
