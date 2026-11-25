import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/app");
const require = createRequire(path.join(appDir, "app.module.ts"));
await import(pathToFileURL(require.resolve("zone.js/node")).href);
await import(pathToFileURL(require.resolve("@angular/compiler")).href);
const core = await import(pathToFileURL(require.resolve("@angular/core")).href);
const { FirebaseApp, getApps, deleteApp } = await import(pathToFileURL(require.resolve("@angular/fire/app")).href);
const { Storage } = await import(pathToFileURL(require.resolve("@angular/fire/storage")).href);

async function loadSource(name) {
  const source = fs.readFileSync(path.join(appDir, name), "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, experimentalDecorators: true },
  });
  const code = result.outputText.replace(
    /from "([^"]+)"/gu,
    (_, specifier) => `from ${JSON.stringify(pathToFileURL(require.resolve(specifier)).href)}`,
  );
  return import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
}

const { provideSharingFirebase } = await loadSource("sharing-firebase.providers.ts");
const { ShareService } = await loadSource("share.service.ts");
assert.equal(getApps().length, 0, "O teste deve iniciar sem Firebase previamente inicializado.");
const injector = core.createEnvironmentInjector(
  [
    { provide: core.ɵINJECTOR_SCOPE, useValue: "root" },
    { provide: core.PLATFORM_ID, useValue: "browser" },
    { provide: core.NgZone, useFactory: () => new core.NgZone({}) },
    ...provideSharingFirebase({
      projectId: "startup-test",
      apiKey: "test-key",
      appId: "test-app",
      storageBucket: "startup-test.appspot.com",
    }),
  ],
  core.Injector.NULL,
);
try {
  const service = core.runInInjectionContext(injector, () => new ShareService());
  assert.ok(service);
  assert.equal(getApps().length, 0, "Construir o serviço do editor não deve inicializar recursos online.");
  const storage = injector.get(Storage);
  assert.equal(
    storage.app,
    injector.get(FirebaseApp),
    "Storage deve usar a instância Firebase inicializada pelo provider.",
  );
  assert.equal(storage.app.name, "[DEFAULT]");
  console.log("ok início frio: Storage usa FirebaseApp explícito e não depende de inicialização anterior");
} finally {
  injector.destroy();
  await Promise.all(getApps().map(app => deleteApp(app)));
}

const broken = core.createEnvironmentInjector(
  [
    {
      provide: Storage,
      useFactory: () => {
        throw new Error("Firebase unavailable");
      },
    },
  ],
  core.Injector.NULL,
);
const originalError = console.error;
try {
  const service = core.runInInjectionContext(broken, () => new ShareService());
  assert.ok(service, "O editor deve poder construir ShareService mesmo com Firebase indisponível.");
  console.error = () => {};
  assert.equal(await service.share("programa {}"), null);
  assert.equal(await service.load("test"), null);
  console.log("ok falha online: compartilhar/carregar retornam falha sem impedir a criação do editor");
} finally {
  console.error = originalError;
  broken.destroy();
}
