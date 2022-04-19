import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Backdrop } from './backdrop';
import { MatBackdrop, MatBackdropTrigger, MatBacklayer, MatBacklayerClose, MatBacklayerContent, MatBacklayerMove, MatBacklayerTitle, MatBacklayerToggle, MatFrontlayer } from './backdrop-directives';
import { MatFrontLayerContainer } from './front-layer-container';
import { MatFrontlayerContent, MatFrontlayerDrop, MatFrontlayerTitle } from './front-layer-directives';


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
    MatFrontlayerDrop
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
    MatFrontlayerDrop
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
