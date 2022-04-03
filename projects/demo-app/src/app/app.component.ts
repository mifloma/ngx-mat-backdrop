import { AfterViewInit, Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Backdrop, FrontLayerRef } from 'ngx-mat-backdrop';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';
import { ItemDetailsComponent } from './item-details/item-details.component';

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

export interface Document {
  title: string,
  date: Date
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  title = 'demo-app';

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('content', { read: TemplateRef })
  private _frontLayerContent!: TemplateRef<any>;
  private _frontLayerRef: FrontLayerRef<any> = null!;
  private _detailsFrontLayerRef: FrontLayerRef<any> = null!;

  private _documents: BehaviorSubject<Document[]> = new BehaviorSubject<Document[]>(ITEMS);

  public filter: FormControl;
  private _filter$: Observable<string>;

  public filteredDocuments$: Observable<Document[]>;

  backlayerColor: 'primary' | 'accent' = 'primary';
  settingsOpened: boolean = false;

  constructor(
    private _backdrop: Backdrop
  ) {
    this.filter = new FormControl('');
    this._filter$ = this.filter.valueChanges.pipe(startWith(''));
    this.filteredDocuments$ = combineLatest([this._documents.asObservable(), this._filter$]).pipe(
      map(([documents, filterString]) => documents.filter(document => document.title.toLowerCase().indexOf(filterString.toLowerCase()) !== -1))
    );
  }

  ngAfterViewInit(): void {
    // this._frontLayerRef = this._backdrop.open(
    //   this._frontLayerContent,
    //   { id: 'documents-list', top: '56px' }
    // );
  }

  onOpenSearch(): void {
    this._focusFrontLayer();
  }

  onOpenSettings(): void {
    this.settingsOpened = true;
    this._focusFrontLayer();
  }

  private _focusFrontLayer() {
    if (this._detailsFrontLayerRef) {
      this._detailsFrontLayerRef.close();
    }
    this.searchInput.nativeElement.focus();
  }

  onOpenItem(document: Document) {
    this._detailsFrontLayerRef = this._backdrop.open(
      ItemDetailsComponent,
      { id: 'document-details', top: '105px', elevation: true }
    );

    this._detailsFrontLayerRef.componentInstance.item = document;
    this._detailsFrontLayerRef.componentInstance.close.subscribe(() => this._detailsFrontLayerRef.close());
  }

  onClose() {
    this.settingsOpened = false;
  }

  onEnter(event: any) {
    this._backdrop.getOpenedFrontLayer()?.lift();
    this.settingsOpened = false;
  }

}
