import { inject, Injectable, Injector } from "@angular/core";
import { getBlob, ref, Storage, uploadString } from "@angular/fire/storage";

@Injectable({ providedIn: "root" })
export class ShareService {
  private injector = inject(Injector);

  async share(code: string): Promise<string | null> {
    const shareId = (Math.random() + 1).toString(36).slice(2, 9);

    try {
      const storage = this.injector.get(Storage);
      await uploadString(ref(storage, `share/${shareId}.por`), code, undefined, {
        contentType: "text/plain",
      });

      return `https://portugol.dev/#share=${shareId}`;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async load(shareId: string): Promise<string | null> {
    try {
      const storage = this.injector.get(Storage);
      const data = await getBlob(ref(storage, `share/${shareId}.por`));
      const contents = await data.text();

      return contents;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
