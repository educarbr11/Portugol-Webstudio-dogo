import path from "node:path";

export const baseDir = path.join(import.meta.dirname, "..", "assets");
export const baseHtmlPath = process.env.BASE_HTML_PATH ?? "";
export const resourcePatchVersion = "infinitive-commands-v2";
