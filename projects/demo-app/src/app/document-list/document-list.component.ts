
import { AfterViewInit, Component, ContentChild, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Backdrop, FrontLayerGroupRef, MatFrontlayerGroup } from 'ngx-mat-backdrop';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { SettingsService } from '../settings/settings.service';

export interface Document {
  title: string,
  date: Date
}

const ITEMS: Document[] = [
  { title: 'Customer Report 2020', date: new Date(2008, 11, 12) },
  { title: 'Tax Calculation', date: new Date(2011, 1, 1) },
  { title: 'Invoices List Foo Company', date: new Date(2021, 7, 12) },
  { title: 'Pricing Calculation 2022', date: new Date(2021, 8, 2) },
  { title: 'Pricing Calculation 2020', date: new Date(2019, 11, 1) },
  { title: 'Email Template Customer Info', date: new Date(2008, 5, 27) },
  { title: 'Customer Report 2019', date: new Date(2018, 7, 21) },
  { title: 'Copy Email Mr. Doe', date: new Date(2018, 7, 21) },
  { title: 'Curriculum Vitae Mrs. Smith', date: new Date(2020, 1, 12) },
  { title: 'Payroll Aug. 2020', date: new Date(2020, 8, 24) },
];

@Component({
  selector: 'app-document-list',
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.scss']
})
export class DocumentListComponent implements AfterViewInit {

  @ViewChild('frontlayerTabs', { read: MatFrontlayerGroup, static: true })
  _frontlayerGroup!: MatFrontlayerGroup;

  @ViewChild('frontlayer1', { read: TemplateRef })
  _frontlayer1!: TemplateRef<any>;

  @ViewChild('frontlayer2', { read: TemplateRef })
  _frontlayer2!: TemplateRef<any>;

  @ViewChild('frontlayer3', { read: TemplateRef })
  _frontlayer3!: TemplateRef<any>;

  @ViewChild('searchInput')
  searchInput!: ElementRef;

  private _documents: BehaviorSubject<Document[]> = new BehaviorSubject<Document[]>(ITEMS);
  private _filter$: Observable<string>;

  public filter: FormControl;
  public filteredDocuments$: Observable<Document[]>;

  settingsOpened: boolean = false;
  private _group!: FrontLayerGroupRef;

  constructor(
    private _router: Router,
    private _backdrop: Backdrop,
    public settings: SettingsService
  ) {
    this.filter = new FormControl('');
    this._filter$ = this.filter.valueChanges.pipe(startWith(''));

    this.filteredDocuments$ = combineLatest([this._documents.asObservable(), this._filter$]).pipe(
      map(([documents, filterString]) =>
        documents.filter(document =>
          document.title.toLowerCase().indexOf(filterString.toLowerCase()) !== -1))
    );
  }

  toggle() {
    if (this._group) {
      this._group.close();
      this._group = null!;
    } else {
      this._group = this._backdrop.openGroup(this._frontlayerGroup._allTabs.map(element => element.templateRef), 1);
    }
  }

  ngAfterViewInit(): void {
    this._backdrop.getOpenedFrontLayer()?.afterDroped()
      .subscribe(() => this.searchInput.nativeElement.focus());
  }

  openPopover() {
    this._backdrop.open(this._frontlayer3, { popover: true });
  }

  onOpenSettings(): void {
    this.settingsOpened = true;
  }

  onOpenItem(document: Document) {
    this._router.navigate(['details']);
  }

  onClose() {
    this.settingsOpened = false;
  }

  onEnter(event: any) {
    this._backdrop.getOpenedFrontLayer()?.lift();
    this.settingsOpened = false;
  }
}
