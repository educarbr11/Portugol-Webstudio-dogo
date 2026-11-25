import { HttpClient } from "@angular/common/http";
import { Component, inject, OnDestroy, OnInit, output } from "@angular/core";
import { Subscription } from "rxjs";

import { ThemeService } from "../theme.service";

export interface ExampleItem {
  id: string;
  name: string;
  type: string;
  file?: string;
  description?: string;
  hasImage?: boolean;
  image?: string;
  dir?: string;
  children?: ExampleItem[];
}

interface CatalogExample {
  item: ExampleItem;
  category: string;
  searchText: string;
}

@Component({
  selector: "app-dialog-open-example",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./dialog-open-example.component.html",
  styleUrl: "./dialog-open-example.component.scss",
})
export class DialogOpenExampleComponent implements OnInit, OnDestroy {
  private _loadSubscription$?: Subscription;
  private _data$?: Subscription;
  private _theme$?: Subscription;
  private http = inject(HttpClient);
  private themeService = inject(ThemeService);
  private catalog: CatalogExample[] = [];
  private pendingOpenId: string | null = null;

  readonly exampleOpened = output<{ title: string; code: string }>();
  current: ExampleItem | null = null;
  currentCategory = "";
  loading = true;
  loadingExample = false;
  catalogError = false;
  previewError = false;
  searchQuery = "";
  selectedCategory = "";
  categories: string[] = [];
  visibleExamples: CatalogExample[] = [];
  totalExamples = 0;

  rawExampleCode = "";
  rawExampleCodeId = "";
  exampleCode = "";
  editor?: monaco.editor.IStandaloneCodeEditor;

  editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    theme: "portugol-dark",
    lineNumbers: "on",
    readOnly: true,
    minimap: { enabled: false },
    language: "portugol",
    automaticLayout: true,
    scrollBeyondLastLine: false,
    fontSize: 13,
    wordWrap: "on",
  };

  get canOpen() {
    return !!this.current && this.rawExampleCodeId === this.current.id && !this.loadingExample && !this.previewError;
  }

  ngOnInit() {
    this.loadCatalog();
    this._theme$ = this.themeService.theme$.subscribe(theme => {
      this.editorOptions = { ...this.editorOptions, theme: `portugol-${theme}` };
    });
  }

  ngOnDestroy() {
    this._data$?.unsubscribe();
    this._theme$?.unsubscribe();
    this._loadSubscription$?.unsubscribe();
  }

  loadCatalog() {
    this._data$?.unsubscribe();
    this.loading = true;
    this.catalogError = false;
    this._data$ = this.http.get<ExampleItem[]>("assets/recursos/exemplos/index.json").subscribe({
      next: data => {
        this.catalog = [];
        const visit = (items: ExampleItem[], parents: string[] = []) => {
          for (const item of items) {
            if (item.file) {
              const category = parents.join(" / ") || "Fundamentos";
              this.catalog.push({
                item,
                category,
                searchText: this.normalize(`${item.name} ${item.description ?? ""} ${category}`),
              });
            }
            if (item.children?.length) visit(item.children, [...parents, item.name]);
          }
        };
        visit(data);
        this.categories = [...new Set(this.catalog.map(example => example.category))];
        this.totalExamples = this.catalog.length;
        this.loading = false;
        this.applyFilters();
        if (!this.current && this.visibleExamples[0]) this.loadItem(this.visibleExamples[0].item);
      },
      error: () => {
        this.loading = false;
        this.catalogError = true;
      },
    });
  }

  applyFilters() {
    const terms = this.normalize(this.searchQuery).split(/\s+/u).filter(Boolean);
    this.visibleExamples = this.catalog.filter(
      example =>
        (!this.selectedCategory || example.category === this.selectedCategory) &&
        terms.every(term => example.searchText.includes(term)),
    );
  }

  clearFilters() {
    this.searchQuery = "";
    this.selectedCategory = "";
    this.applyFilters();
  }

  loadItem(item: ExampleItem) {
    if (!item.file || (this.current?.id === item.id && (this.canOpen || this.loadingExample))) return;
    this.pendingOpenId = null;
    this._loadSubscription$?.unsubscribe();
    this.current = item;
    this.currentCategory = this.catalog.find(example => example.item.id === item.id)?.category ?? "";
    this.exampleCode = "";
    this.rawExampleCode = "";
    this.rawExampleCodeId = "";
    this.loadingExample = true;
    this.previewError = false;
    const file = item.file.replaceAll("\\", "/");
    this._loadSubscription$ = this.http.get(`assets/recursos/exemplos/${file}`, { responseType: "text" }).subscribe({
      next: code => {
        if (this.current?.id !== item.id) return;
        this.rawExampleCode = code;
        this.rawExampleCodeId = item.id;
        const commentEndPos = code.indexOf("*/");
        this.exampleCode = code.slice(commentEndPos === -1 ? 0 : commentEndPos + 2).trim();
        this.loadingExample = false;
        if (this.pendingOpenId === item.id) {
          this.pendingOpenId = null;
          this.exampleOpened.emit({ title: item.name, code });
        }
      },
      error: () => {
        if (this.current?.id !== item.id) return;
        this.previewError = true;
        this.loadingExample = false;
      },
    });
  }

  openExample(item: ExampleItem) {
    if (this.current?.id !== item.id) {
      this.loadItem(item);
      this.pendingOpenId = item.id;
      return;
    }
    if (this.canOpen) this.exampleOpened.emit({ title: item.name, code: this.rawExampleCode });
    else if (this.loadingExample) this.pendingOpenId = item.id;
  }

  private normalize(value: string) {
    return value
      .normalize("NFD")
      .replaceAll(/[\u0300-\u036F]/gu, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }
}
