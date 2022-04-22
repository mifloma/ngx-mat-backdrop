
import { AfterViewInit, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Backdrop } from 'ngx-mat-backdrop';
import { BehaviorSubject, combineLatest, map, Observable, startWith } from 'rxjs';

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

  @ViewChild('popover', { read: TemplateRef })
  _popover!: TemplateRef<any>;

  @ViewChild('searchInput')
  searchInput!: ElementRef;

  private _documents: BehaviorSubject<Document[]> = new BehaviorSubject<Document[]>(ITEMS);
  private _filter$: Observable<string>;

  public filter: FormControl;
  public filteredDocuments$: Observable<Document[]>;

  backlayerColor: 'primary' | 'accent' = 'primary';
  settingsOpened: boolean = false;

  constructor(
    private _router: Router,
    private _backdrop: Backdrop
  ) {
    this.filter = new FormControl('');
    this._filter$ = this.filter.valueChanges.pipe(startWith(''));

    this.filteredDocuments$ = combineLatest([this._documents.asObservable(), this._filter$]).pipe(
      map(([documents, filterString]) =>
        documents.filter(document =>
          document.title.toLowerCase().indexOf(filterString.toLowerCase()) !== -1))
    );
  }

  ngAfterViewInit(): void {
    this._backdrop.getOpenedFrontLayer()?.afterDroped()
      .subscribe(() => this.searchInput.nativeElement.focus());
  }

  onOpenSettings(): void {
    this.settingsOpened = true;
  }

  onOpenItem(document: Document) {
    // this._router.navigate(['details']);
    this._backdrop.open(this._popover, {
      id: 'concept-list',
      top: '56px',
      popover: true
    })
  }

  onClose() {
    this.settingsOpened = false;
  }

  onEnter(event: any) {
    this._backdrop.getOpenedFrontLayer()?.lift();
    this.settingsOpened = false;
  }
}
