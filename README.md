# NgxMatBackdrop

Implementation of Material Design [Backdrop](https://material.io/components/backdrop) for Angular.  

![Backdrop Example](./docs/backdrop-example.png)

### Installation

`npm install ngx-mat-backdrop --save`

### Usage

Import `MatBackdropModule` into your application:

```typescript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    MatBackdropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

The `MatBackdrop` consist of three elements: The `Backdrop-Container`, a `Backlayer` and a `Frontlayer`:

```html
<mat-backdrop [matBackdropTriggerFor]="frontlayer">
  <mat-backlayer>
    ... <-- Place your backlayer content here
  </mat-backlayer>

  <mat-frontlayer #frontlayer>
    ... <-- Place your frontlayer content here
  </mat-frontlayer>
</mat-backdrop>
```

