import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { Backdrop, FrontLayerRef } from 'ngx-mat-backdrop';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ItemDetailsComponent } from './item-details/item-details.component';

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

  @ViewChild('content', { read: TemplateRef })
  private _frontLayerContent!: TemplateRef<any>;
  private _frontLayerRef: FrontLayerRef<any> = null!;
  private _detailsFrontLayerRef: FrontLayerRef<any> = null!;

  items: Document[] = [
    { title: 'My Document 1', date: new Date(2008, 11, 12) },
    { title: 'My Document 2', date: new Date(2011, 1, 1) },
    { title: 'My Document 3', date: new Date(2021, 7, 12) },
    { title: 'My Document 4', date: new Date(2021, 8, 2) },
    { title: 'My Document 5', date: new Date(2029, 11, 1) },
    { title: 'My Document 6', date: new Date(2008, 5, 27) },
    { title: 'My Document 7', date: new Date(2018, 7, 21) },
    { title: 'My Document 8', date: new Date(2018, 7, 21) },
    { title: 'My Document 9', date: new Date(2020, 1, 12) },
    { title: 'My Document 10', date: new Date(2020, 8, 24) },
  ];

  private _documents: BehaviorSubject<Document[]> = new BehaviorSubject<Document[]>(this.items);
  private _search: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public documents$: Observable<Document[]> = combineLatest([this._documents.asObservable(), this._search]).pipe(
    map(([documents, search]) => documents.filter(document => document.title.includes(search)))
  );

  constructor(
    private _backdrop: Backdrop
  ) { }

  ngAfterViewInit(): void {
    this._frontLayerRef = this._backdrop.open(
      this._frontLayerContent,
      { id: 'test', top: '56px' }
    );
  }

  onOpenContextMenu(): void {
    if (this._detailsFrontLayerRef) {
      this._detailsFrontLayerRef.close();
    }
    this._frontLayerRef.drop(250, true);
  }

  onCloseContextMenu(): void {
    this._frontLayerRef.lift();
  }

  onOpenItem(item: Document) {
    this._detailsFrontLayerRef = this._backdrop.open(
      ItemDetailsComponent,
      { id: 'details', top: '96px', elevation: true }
    );

    this._detailsFrontLayerRef.componentInstance.item = item;
    this._detailsFrontLayerRef.componentInstance.close.subscribe(() => this._detailsFrontLayerRef.close());
  }

  onInput(event: any) {
    if (event.target.value) {
      this._search.next(event.target.value);
    }
  }

}
