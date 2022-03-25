import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { Backdrop, FrontLayerRef } from 'ngx-mat-backdrop';

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

  constructor(
    private _backdrop: Backdrop
  ) { }

  ngAfterViewInit(): void {
    this._frontLayerRef = this._backdrop.open(
      this._frontLayerContent,
      { id: 'test', top: '56px' }
    );
  }

}
