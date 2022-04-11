import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Backdrop } from './backdrop';
import { MatBackdrop, MatBackdropTrigger, MatBacklayer, MatBacklayerClose, MatBacklayerContent, MatBacklayerMove, MatBacklayerTitle, MatBacklayerToggle, MatFrontlayer } from './backdrop-directives';
import { MatFrontLayerContainer } from './front-layer-container';
import { MatFrontLayerClose, MatFrontlayerContent, MatFrontlayerTitle } from './front-layer-directives';


@NgModule({
  declarations: [
    MatBackdrop,
    MatBackdropTrigger,
    MatBacklayer,
    MatBacklayerTitle,
    MatBacklayerToggle,
    MatBacklayerClose,
    MatBacklayerMove,
    MatBacklayerContent,
    MatFrontlayer,
    MatFrontLayerContainer,
    MatFrontlayerContent,
    MatFrontlayerTitle,
    MatFrontLayerClose
  ],
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule
  ],
  exports: [
    MatBacklayer,
    MatBackdropTrigger,
    MatBacklayerTitle,
    MatBacklayerToggle,
    MatBacklayerClose,
    MatBacklayerMove,
    MatBacklayerContent,
    MatFrontlayerContent,
    MatFrontlayerTitle,
    MatBackdrop,
    MatFrontlayer,
    MatFrontLayerClose
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
