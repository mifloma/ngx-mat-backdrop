import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatBackdropModule } from 'ngx-mat-backdrop';

import { AppComponent } from './app.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DocumentDetailsComponent } from './document-details/document-details.component';
import { RouterModule, Routes } from '@angular/router';
import { DocumentListComponent } from './document-list/document-list.component';

const routes: Routes = [
  { path: '', component: DocumentListComponent },
  { path: 'details', component: DocumentDetailsComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    ItemDetailsComponent,
    DocumentDetailsComponent,
    DocumentListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatDividerModule,
    MatRadioModule,
    MatBackdropModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
