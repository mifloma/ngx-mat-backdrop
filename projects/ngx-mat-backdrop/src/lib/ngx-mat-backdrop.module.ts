import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Backdrop } from './backdrop';
import { BackdropContainer, BackdropContextMenu, BackdropTitle } from './backdrop-directives';
import { FrontLayerContainer } from './front-layer-container';
import { FrontLayerContent, FrontLayerTitle } from './front-layer-directives';
import { MatBackdropButton } from './backdrop-button';


@NgModule({
  declarations: [
    BackdropContainer,
    BackdropTitle,
    BackdropContextMenu,
    FrontLayerContainer,
    FrontLayerContent,
    FrontLayerTitle,
    MatBackdropButton
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
    FrontLayerContent,
    FrontLayerTitle,
    MatBackdropButton
  ],
  providers: [Backdrop]
})
export class MatBackdropModule {
  static forRoot(): ModuleWithProviders<MatBackdropModule> {
    return {
      ngModule: MatBackdropModule,
      providers: [Backdrop]
    }
  }
}
