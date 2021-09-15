import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Backdrop } from './backdrop/backdrop';
import { FrontLayerConfig } from './backdrop/front-layer-config';
import { FrontLayerRef, FrontLayerState } from './backdrop/front-layer-ref';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('frontLayer', { read: TemplateRef })
  private frontLayerContent!: TemplateRef<any>;

  private frontLayerRef!: FrontLayerRef<any>;
  private popupLayerRef!: FrontLayerRef<any>;

  title = 'backdrop-poc';
  disabledList = false;
  items = [
    { id: 1, text: 'Hallo' },
    { id: 2, text: 'Test' },
    { id: 3, text: 'Foo Bar' },
    { id: 4, text: 'Bla Bla' },
  ];

  constructor(
    private backdrop: Backdrop
  ) { }

  showSettings() {
    return this.frontLayerRef &&
      (this.frontLayerRef.getState() === FrontLayerState.OPEN
        || this.frontLayerRef.getState() === FrontLayerState.DROPED)
  }

  open3() {
    if (this.frontLayerRef && !this.popupLayerRef) {
      this.frontLayerRef.close();
      this.frontLayerRef = null!;
    } else if (!this.popupLayerRef) {
      this.frontLayerRef = this.backdrop.open(this.frontLayerContent);
    }
  }

  openPopup() {
    if (this.popupLayerRef) {
      this.popupLayerRef.close();
      this.popupLayerRef = null!;
    } else if (this.frontLayerRef && this.frontLayerRef.getState() === FrontLayerState.OPEN) {
      this.popupLayerRef = this.backdrop.open(this.frontLayerContent, { top: '94px' });
    }
  }

  drop() {
    if (this.frontLayerRef.getState() === FrontLayerState.DROPED) {
      this.frontLayerRef.lift();
    } else {
      this.frontLayerRef.drop(200, true);
    }
  }
}
