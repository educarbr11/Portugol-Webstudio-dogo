import { EnvironmentProviders } from "@angular/core";
import { FirebaseApp, FirebaseOptions, initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getStorage, provideStorage } from "@angular/fire/storage";

export function provideSharingFirebase(options: FirebaseOptions): EnvironmentProviders[] {
  return [
    provideFirebaseApp(() => initializeApp(options)),
    provideStorage(injector => getStorage(injector.get(FirebaseApp))),
  ];
}
