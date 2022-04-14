import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Backdrop } from 'ngx-mat-backdrop';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss']
})
export class DocumentDetailsComponent implements OnInit {

  constructor(
    private _router: Router,
    private _backdrop: Backdrop
  ) { }

  ngOnInit(): void {
  }

  onBack() {
    // let _frontlayer = this._backdrop.getOpenedFrontLayer()
    // _frontlayer?.close();
    this._router.navigate(['']);
  }

}
