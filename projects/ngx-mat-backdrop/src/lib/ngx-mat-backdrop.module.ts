import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Backdrop } from './backdrop';
import { BackdropContainer, BackdropContextMenu, BackdropTitle } from './backdrop-directives';
import { FrontLayerContainer } from './front-layer-container';
import { FrontLayerContent, FrontLayerTitle } from './front-layer-directives';


@NgModule({
  declarations: [
    BackdropContainer,
    BackdropTitle,
    BackdropContextMenu,
    FrontLayerContainer,
    FrontLayerContent,
    FrontLayerTitle
  ],
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule
  ],
  exports: [
    BackdropContainer,
    BackdropTitle,
    BackdropContextMenu,
    FrontLayerContainer,
    FrontLayerContent,
    FrontLayerTitle,
  ],
  providers: [Backdrop]
})
export class NgxMatBackdropModule {
}
