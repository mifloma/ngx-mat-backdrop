import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Backdrop, MatFrontlayer } from 'ngx-mat-backdrop';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss']
})
export class DocumentDetailsComponent {

  constructor(
    private _router: Router
  ) { }

  onBack() {
    this._router.navigate(['']);
  }

}
