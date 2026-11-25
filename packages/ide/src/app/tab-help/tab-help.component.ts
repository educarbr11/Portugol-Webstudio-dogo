import { NestedTreeControl } from "@angular/cdk/tree";
import { HttpClient } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  output,
  viewChild,
} from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { GoogleAnalyticsService } from "ngx-google-analytics";
import { Subscription } from "rxjs";

import { ResponsiveService } from "../responsive.service";
import { ThemeService } from "../theme.service";
import { libsTree } from "./bibliotecas";
import { getHelpContentBlocks, HelpContentBlock, HelpExample } from "./help-content";
import { arduinoTutorialsTree } from "./tutoriais-arduino";
import { TreeItem } from "./types";

interface HelpSearchEntry {
  item: TreeItem;
  path: string;
  searchText: string;
}

type PortugolWindow = Window & {
  portugol: { abrirExemplo(contents: string, name: string): void };
};

@Component({
  selector: "app-tab-help",
  // eslint-disable-next-line @angular-eslint/prefer-standalone
  standalone: false,
  templateUrl: "./tab-help.component.html",
  styleUrl: "./tab-help.component.scss",
})
export class TabHelpComponent implements OnInit, OnDestroy, AfterViewInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private ngZone = inject(NgZone);
  private gaService = inject(GoogleAnalyticsService);
  private responsive = inject(ResponsiveService);
  private themeService = inject(ThemeService);
  private readonly helpPane = viewChild<unknown, ElementRef<HTMLElement>>("helpPane", { read: ElementRef });

  _responsive$?: Subscription;
  _theme$?: Subscription;
  private helpTree$?: Subscription;
  private content$?: Subscription;

  // eslint-disable-next-line @typescript-eslint/no-deprecated
  treeControl = new NestedTreeControl<TreeItem>(node => node.children);
  dataSource = new MatTreeNestedDataSource<TreeItem>();
  current?: TreeItem;
  currentUrl?: SafeResourceUrl;
  contentBlocks: HelpContentBlock[] = [];
  loadingContent = false;
  contentError = false;
  navigationError = false;
  searchQuery = "";
  searchResults: HelpSearchEntry[] = [];
  currentPath = "Arduino e ESP32";
  private searchIndex: HelpSearchEntry[] = [];

  isBelowMd = false;
  isLightTheme = false;

  readonly newTab = output<{ name: string; contents: string }>();

  ngOnInit() {
    (window as unknown as PortugolWindow).portugol = {
      abrirExemplo: (contents: string, name: string) => {
        this.ngZone.run(() => {
          this.newTab.emit({ name, contents });
        });
      },
    };

    this.setNavigation([arduinoTutorialsTree, libsTree]);
    this.treeControl.expand(arduinoTutorialsTree);
    this.loadItem(arduinoTutorialsTree);

    this.helpTree$ = this.http.get<TreeItem[]>("assets/recursos/ajuda/scripts/topicos.json").subscribe({
      next: ajuda => {
        this.setNavigation([arduinoTutorialsTree, ...ajuda, libsTree]);
      },
      error: () => {
        this.navigationError = true;
      },
    });

    this._theme$ = this.themeService.theme$.subscribe(theme => {
      this.isLightTheme = theme === "light";
    });
  }

  ngAfterViewInit() {
    this._responsive$ = this.responsive.isBelowMd().subscribe(isBelowMd => {
      this.isBelowMd = isBelowMd.matches;
    });
  }

  ngOnDestroy() {
    this._responsive$?.unsubscribe();
    this._theme$?.unsubscribe();
    this.helpTree$?.unsubscribe();
    this.content$?.unsubscribe();
  }

  hasChildren(_: number, item: TreeItem) {
    return item.children?.length ?? 0;
  }

  selectTopic(item: TreeItem) {
    if (item.children?.length) this.treeControl.expand(item);
    this.loadItem(item);
  }

  searchTopics() {
    const terms = this.normalize(this.searchQuery).split(/\s+/u).filter(Boolean);
    this.searchResults =
      terms.length > 0 ? this.searchIndex.filter(entry => terms.every(term => entry.searchText.includes(term))) : [];
  }

  clearSearch() {
    this.searchQuery = "";
    this.searchResults = [];
  }

  private setNavigation(items: TreeItem[]) {
    this.dataSource.data = items;
    this.searchIndex = [];
    const visit = (nodes: TreeItem[], parents: string[] = []) => {
      for (const item of nodes) {
        const path = parents.join(" / ");
        this.searchIndex.push({ item, path, searchText: this.normalize(`${path} ${item.text} ${item.source ?? ""}`) });
        if (item.children?.length) visit(item.children, [...parents, item.text]);
      }
    };
    visit(items);
    this.searchTopics();
  }

  private normalize(value: string) {
    return value
      .normalize("NFD")
      .replaceAll(/[\u0300-\u036F]/gu, "")
      .toLocaleLowerCase("pt-BR")
      .trim();
  }

  loadItem(item: TreeItem) {
    this.currentPath = this.searchIndex.find(entry => entry.item.id === item.id)?.path || "Central de ajuda";
    this.content$?.unsubscribe();
    this.helpPane()?.nativeElement.scrollTo(0, 0);
    this.gaService.event("help_navigation", "Ajuda", item.href || item.id);
    this.gaService.pageView(item.href || item.id, item.text, item.href || item.id);
    this.current = item;
    this.contentBlocks = [];
    this.contentError = false;
    this.loadingContent = false;

    if (item.kind !== "markdown") {
      this.currentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`assets/recursos/ajuda/${item.href}`);
      return;
    }

    this.currentUrl = undefined;

    if (!item.markdownPath) {
      this.contentBlocks = getHelpContentBlocks(item.source ?? "", item.text);
      return;
    }

    this.loadingContent = true;
    this.content$ = this.http.get(item.markdownPath, { responseType: "text" }).subscribe({
      next: source => {
        this.contentBlocks = getHelpContentBlocks(source, item.text);
        this.loadingContent = false;
      },
      error: () => {
        this.contentError = true;
        this.loadingContent = false;
      },
    });
  }

  openExample(example: HelpExample) {
    this.gaService.event("help_open_example", "Ajuda", this.current?.id);
    this.newTab.emit(example);
  }
}
