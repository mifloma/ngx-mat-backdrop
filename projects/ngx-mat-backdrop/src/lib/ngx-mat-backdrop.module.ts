import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Backdrop } from './backdrop';
import { MatBackdropButton } from './backdrop-button';
import { MatBackdrop, MatBackdropTrigger, MatBacklayer, MatBacklayerContent, MatBacklayerTitle, MatFrontlayer } from './backdrop-directives';
import { MatFrontLayerContainer } from './front-layer-container';
import { MatFrontLayerButton, MatFrontlayerContent, MatFrontlayerTitle } from './front-layer-directives';


@NgModule({
  declarations: [
    MatBackdrop,
    MatBackdropTrigger,
    MatBacklayer,
    MatBacklayerTitle,
    MatBackdropButton,
    MatBacklayerContent,
    MatFrontlayer,
    MatFrontLayerContainer,
    MatFrontlayerContent,
    MatFrontlayerTitle,
    MatFrontLayerButton
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
    MatBacklayerContent,
    MatFrontlayerContent,
    MatFrontlayerTitle,
    MatBackdropButton,
    MatBackdrop,
    MatFrontlayer,
    MatFrontLayerButton
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
