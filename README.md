# NgxMatBackdrop

Implementation of Material Design [Backdrop](https://material.io/components/backdrop) for Angular.  

![Backdrop Example](https://github.com/mifloma/ngx-mat-backdrop/blob/main/docs/backdrop-example.png)  

__[StackBlitz](https://stackblitz.com/edit/ngx-mat-backdrop-demo)__

### Installation

`npm install ngx-mat-backdrop --save`

### Usage

Import `BrowserModule`, `BrowserAnimationsModule` and `MatBackdropModule` into your application:

```typescript
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatBackdropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

`MatBackdrop` works seamlessly with Angular Material. You can combine it with all Angular Material components.

### Theming

`MatBackdrop` supports Angular Material's component theming. You can apply one of the predefines Material-Themes or a custom theme to `MatBackdrop`. Also `MatBackdrop` supports Angular Material's typography system:

```scss
@use '@angular/material' as mat;
@use 'ngx-mat-backdrop/theming' as backdrop;

$primary-palette: mat.define-palette(mat.$deep-purple-palette, 500);
$accent-palette: mat.define-palette(mat.$amber-palette, A200, A100, A400);

$light-theme: mat.define-light-theme((
 color: (
   primary: $primary-palette,
   accent: $accent-palette
 ),
 typography: mat.define-typography-config(
    $font-family: 'Roboto',
  )
));

// Include theme styles for Angular Material components.
@include mat.all-component-themes($light-theme);

// Include theme styles for ngx-mat-backdrop components.
@include backdrop.backdrop-theme($light-theme);
```

### Basic Backdrop section

The most basic `Backdrop` needs only three elements: The `Backdrop-Container`, a `Backlayer` and a `Frontlayer`:

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

`MatBackdrop` provides a number of preset sections that you can use inside of `<mat-backlayer>`- or `<mat-frontlayer>`-section:

| Element | Description |
| ------- | ----------- |
| `<mat-backlayer-title>` | Sticky toolbar on top of the `Backlayer` |
| `<mat-backlayer-content>` | `Backlayer` content section, hidden by the `Frontlayer`. This section gets revealed due to a user action |
| `<mat-frontlayer-title>` | Sticky `Frontlayer` title |
| `<mat-frontlayer-content>` | Scrollable content of the `Frontlayer` |
| `<mat-frontlayer-actions>`| Sticky container for action buttons at the bottom of the `Frontlayer` |

### Backlayer title

`<mat-backlayer-title>` gives the ability to add a rich header to the `Backlayer`. `MatBackdrop` provides preset elements, a header can contain:

#### Backlayer close

The `<mat-backlayer-close>`-Directive enriches a user defined button with the ability to conceal the `<mat-backlayer-content>`-section. If `<mat-backlayer-content>`-section is not revealed the button triggers the user-defined default function. `<mat-backlayer-close>` defines two events:

1. `close` - The button has been clicked while `<mat-backlayer-content>`-section was revealed
2. `default` - The button has been clicked while `<mat-backlayer-content>`-section was NOT revealed. Execute your default functionality here.

```html
<mat-backlayer-title>
  <button mat-backlayer-close (default)="onNavigateBack()" (close)="onAfterRevealing()">
    <mat-icon>menu</mat-icon>
  </button>
</mat-backlayer-title>
<mat-backlayer-content>
  ...
</mat-backlayer-content>
```

#### Backlayer toggle

The `<mat-backlayer-toggle>`-Directive enriches a user defined button with the ability to dynamically reveal or conceal the `<mat-backlayer-content>`-section, depending on its current state:

```html
<mat-backlayer-title>
  <button mat-backlayer-toggle [offset]="'250px'">
    <mat-icon>menu</mat-icon>
  </button>
</mat-backlayer-title>
<mat-backlayer-content>
  ...
</mat-backlayer-content>
```

The `[offset]`-Parameter defines the new position of the `Frontlayer` after button click. If you give this parameter the value `'full'` the `Backlayer` gets fully revealed, means the `Frontlayer` moves to the bottom of the viewport.

#### Backlayer move

The `<mat-backlayer-move>` -Directive enriches a user defined button with the ability to change the position of the `Frontlayer` after `<mat-backlayer-content>`-section has been concealed.  

__ProTip:__ Use `<mat-backlayer-move>`-Directive and set the `[offset]`-Parameter to `'full'` to reveal a second `Backlayer`-section, e.g. for showing some user settings.

#### Backlayer events

A `Backlayer` button directive notifies you when it has finished concealing or revealing the `<mat-backlayer-content>`-section using one of the following events: `(open)`, `(close)` or `(move)`:

```html
<mat-backlayer-title>
  <button mat-backlayer-toggle [offset]="'full'" (open)="onOpenSettings()" (close)="onCloseSettings()">
    <mat-icon>tune</mat-icon>
  </button>
</mat-backlayer-title>
```

### Frontlayer title

With `<mat-frontlayer-title>` you can create a subtitle on the `Frontlayer`:

```html
<mat-frontlayer #frontlayer>
  <h2 mat-frontlayer-title>Subtitle</h2>
  <mat-frontlayer-content>
    ...
  </mat-frontlayer-content>
</mat-frontlayer>
```

`<mat-frontlayer-title>` also gives the ability to add a rich header to the `Frontlayer`. `MatBackdrop` provides preset elements, a header can contain:

#### Frontlayer drop

The `<mat-frontlayer-drop>`-Directive enriches a user defined button with the ability to dynamically reveal or conceal the `<mat-backlayer-content>`-section, depending on its current state:

```html
<mat-frontlayer #frontlayer>
  <mat-frontlayer-title>
    <h2>Subtitle</h2>
    <span style="flex: 1"></span>
    <button mat-frontlayer-drop [offset]="250px">
      <mat-icon>expand_more</mat-icon>
    </button>
  </mat-frontlayer-title>
  <mat-frontlayer-content>
    ...
  </mat-frontlayer-content>
</mat-frontlayer>
```

The `[offset]`-Parameter defines the new position of the `Frontlayer` after button click. If you give this parameter the value `'full'` the `Backlayer` gets fully revealed, means the `Frontlayer` moves to the bottom of the viewport.

__ProTip:__ You can combine `<mat-frontlayer-drop>` with `<mat-backlayer-toggle>` or `<mat-backlayer-close>`.

### Frontlayer actions

Sticky container for action buttons at the bottom of the `Frontlayer`. Button alignment can be controlled via the `align` attribute which can be set to `end` and `center`:

```html
<mat-frontlayer #frontlayer>
  <h2 mat-frontlayer-title>Subtitle</h2>
  <mat-frontlayer-content>
    ...
  </mat-frontlayer-content>
  <mat-frontlayer-actions>
    <button mat-button (click)="onNext()">previous</button>
    <button mat-button (click)="onPrev()">next</button>
  </mat-frontlayer-actions>
</mat-frontlayer>
```

### Navigation

To support common browser functions, `MatBackdrop` navigation is based on Angular Routing. A `Frontlayer` is a global, static overlay element that can be used across page switches.

#### Parent child navigation

For navigating between parent and child views (e.g. between product-list-view and product-details-view) you can use Angular Routing. Place a `<mat-backdrop>` on every component that is involved in the workflow. `MatBackdrop` replaces the content of the `Frontlayer` after navigation.

__ProTip:__ Avoid too many navigation levels. Rule of thumb: Two levels are ideal (parent -> child), three levels are the maximum (parent -> child -> child).

#### Peer navigation

For navigating between different contexts (e.g. between products-view and customers-view) you can also use Angular Routing. For a better user experience, it is advisable to close the `Frontlayer` before navigating. `MatBackdrop` opens a new `Frontlayer` on the next view, which gives the user a stronger signal of the context change:

```typescript
onOpenCustomers() {
  this._backdrop.getOpenedFrontLayer()?.close();
  this._router.navigate(['customers']);
}
```

#### Popover

Like demonstrated in the [Crane Case Study](https://material.io/design/material-studies/crane.html), `MatBackdrop` can show up a second `Frontlayer` as a popover. The popover works like a `MatDialog` and freezes all underlaying layers. Use this kind of navigation if you want to show some extra information to the user:  

You can show a `<ng-template>` or a component on the popover `Frontlayer`:  

```html
<ng-template #picture>
    <h2 mat-frontlayer-title>{{ product.name }}</h2>
    <mat-frontlayer-content>
      <img src="'{{ product.picture }}'">
    </mat-frontlayer-content>
</ng-template>
```

Next, inject the `TemplateRef` and launch it on a new `Frontlayer`. With the configuration property `popover` you can force `MatBackdrop` to open a second `Frontlayer`:

```typescript
@ViewChild('picture', { read: TemplateRef })
  _pictureTemplate!: TemplateRef<any>;

...

onOpenProductPricture() {
  this._backdrop.open(_pictureTemplate, { popup: true });
}
```

__ProTip:__ A good workflow could be product-list-view (parent) -> product-details-view (child) -> product-picture (popover)

#### Close Popover

The `<mat-frontlayer-close>`-Directive enriches a user defined button with the ability to close a popover `Frontlayer`:

```html
<ng-template #picture>
    <div mat-frontlayer-title>
        <h2>{{ product.name }}</h2>
        <div style="flex: 1 1 auto"></div>
        <button mat-frontlayer-close>
            <mat-icon>expand_more</mat-icon>
        </button>
    </div>
    <mat-frontlayer-content>
      <img src="'{{ product.picture }}'">
    </mat-frontlayer-content>
</ng-template>
```

### Angular Routing between (lazy loading) modules

For navigation between views of different (lazy loading) modules, you must import the `MatBackdropModule` with `forRoot()` in your app-module and additionally in every other module:

```typescript
@NgModule({
  declarations: [ AppComponent ],
  imports: [ MatBackdropModule.forRoot() ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }

@NgModule({
  declarations: [ CustomerListComponent, CustomerDetailsComponent ],
  imports: [ MatBackdropModule ]
})
export class CustomersModule { }

@NgModule({
  declarations: [ ProductListComponent, ProductDetailsComponent ],
  imports: [ MatBackdropModule ]
})
export class ProductsModule { }
```

## Accessibility

`MatBackdrop` creates its elements with a default ARIA Pattern.

| Element | Role |
| ------- | ---- |
| MatBacklayerTitle | navigation |
| MatBacklayerContent | menu |
| MatFrontlayer | main |
| MatFrontlayerTitle | heading |
| MatFrontlayerContent | region |

You can change the `MatFrontlayers` role to `dialog` or `alertdialog` via `MatFrontLayerConfig`.  

All elements have also default accessible labels. You can change them by setting the `ariaLabel` or `ariaLabeledBy` properties. For changing the accesibility label of `MatFrontlayer` you can set `ariaLabel` property of `MatFrontLayerConfig`.

### Focus management

When `MatBacklayerContent` is revealed, `MatBackdrop` traps browsers focus such that it cannot escape the `MatBacklayer`. With this behavior it navigates the user through the revealed context menu. If the user conceales the menu browsers focus switches back to the main region (`MatFrontlayer`).  

By default, the first tabbable element on the `MatBacklayer` receives focus. You can customize which element receives focus with the `autoFocus` property of `MatFrontLayerConfig`, which supports the following values:

| Value | Behavior |
| ----- | -------- |
| true | Focus the first tabbable element. This is the default setting. |
| false | Focus stays on last focused element. |
| Any CSS selector | Focus the first element matching the given selector. |

### Focus restoration

When `MatBacklayerContent` reveales, `MatFrontlayerTitle` receives focus. If no `MatFrontLayerTitle` element exists, the first tabbable element on the `MatFrontlayer` recieves focus. You can customize which element receives focus with the `autoFocus` property of `MatFrontLayerConfig`, which supports the following values:

| Value | Behavior |
| ----- | -------- |
| true | Focus the frontlayer heading or the first tabbable element. This is the default setting. |
| false | Focus stays on last focused element. |
| Any CSS selector | Focus the first element matching the given selector. |

## Experimental

### Peer navigation without routing

With `<mat-frontlayer-group>` a frontlayer can contain multiple tabs like demonstrated in the [Crane Case Study](https://material.io/design/material-studies/crane.html). Each  The user can navigate between the tabs without leaving the current view:  

```html
<mat-frontlayer-group #frontlayerGroup>
    <mat-frontlayer>
        <!-- content of tab 1 -->
    </mat-frontlayer>
    <mat-frontlayer>
        <!-- content of tab 2 -->
    </mat-frontlayer>
    <mat-frontlayer>
        <!-- content of tab 3 -->
    </mat-frontlayer>
</mat-frontlayer-group>
```

You can create the `FrontlayerGroup` after the view has been initialized. You have to unwrap all tabs and open them as a group of `Frontlayer`. The second paramenter specifies the index of the default tab that gets focused first:  

```typescript
@ViewChild('frontlayerGroup', { read: MatFrontlayerGroup, static: true })
private _frontlayerGroup!: MatFrontlayerGroup;

ngAfterViewInit(): void {
    this._backdrop.openGroup(this._frontlayerGroup._allTabs.map(tab => tab.templateRef), 1);
}
```

#### Switch tab

The `<mat-backlayer-switch-tab>`-Directive enriches a user defined button with the ability to switch between the tabs of a `Frontlayer Group`:  

```html
<mat-backlayer [color]="settings.backlayerColor">
    <mat-backlayer-title>
        <button mat-button [mat-backlayer-switch-tab]="0">Products</button>
        <button mat-button [mat-backlayer-switch-tab]="1">Customers</button>
        <button mat-button [mat-backlayer-switch-tab]="2">Delivery</button>
    </mat-backlayer-title>
</mat-backlayer>
```