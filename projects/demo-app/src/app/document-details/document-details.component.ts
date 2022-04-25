import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Backdrop, FrontLayerState, MatFrontlayer } from 'ngx-mat-backdrop';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss']
})
export class DocumentDetailsComponent {

  @ViewChild('popover', { read: TemplateRef })
  _popover!: TemplateRef<any>;

  settingsOpened: boolean = false;

  constructor(
    private _router: Router,
    private _backdrop: Backdrop,
    public settings: SettingsService
  ) { }

  showDetails() {
    this._backdrop.open(this._popover, {
      top: '50px',
      popover: true
    })
  }

  onOpenSettings(): void {
    this.settingsOpened = true;
  }

  onCloseSettings() {
    this.settingsOpened = false;
  }

  onBack() {
    let _frontLayer = this._backdrop.getOpenedFrontLayer();
    if (_frontLayer?.getState() !== FrontLayerState.DROPED) {
      this._router.navigate(['']);
    }
  }

}
