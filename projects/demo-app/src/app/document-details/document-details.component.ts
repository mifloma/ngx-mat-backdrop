import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Backdrop } from 'ngx-mat-backdrop';
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
    this._router.navigate(['']);
  }

}
