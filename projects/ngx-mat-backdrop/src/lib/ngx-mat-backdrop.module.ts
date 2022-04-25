import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Backdrop } from './backdrop';
import { MatBackdrop, MatBackdropTrigger, MatBacklayer, MatBacklayerClose, MatBacklayerContent, MatBacklayerMove, MatBacklayerTitle, MatBacklayerToggle, MatFrontlayer } from './backdrop-directives';
import { MatFrontLayerContainer } from './front-layer-container';
import { MatFrontlayerActions, MatFrontLayerClose, MatFrontlayerContent, MatFrontlayerDrop, MatFrontlayerTitle } from './front-layer-directives';


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
    MatFrontlayerActions,
    MatFrontlayerDrop,
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
    MatFrontlayerActions,
    MatBackdrop,
    MatFrontlayer,
    MatFrontlayerDrop,
    MatFrontLayerClose
  ]
})
export class MatBackdropModule {
  static forRoot(): ModuleWithProviders<MatBackdropModule> {
    return {
      ngModule: MatBackdropModule,
      providers: [Backdrop]
    }
  }
}
