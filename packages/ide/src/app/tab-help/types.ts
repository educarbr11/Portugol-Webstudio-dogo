export interface TreeItem {
  id: string;
  text: string;
  href?: string;
  source?: string;
  markdownPath?: string;
  children?: TreeItem[];
  kind?: "href" | "markdown";
}
