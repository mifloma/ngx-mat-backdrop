import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Backdrop } from './backdrop';
import { MatBacklayer, MatBacklayerContent, MatBacklayerTitle, MatBackdrop, MatFrontlayer, MatBackdropTrigger } from './backdrop-directives';
import { MatFrontLayerContainer } from './front-layer-container';
import { MatFrontlayerContent, MatFrontlayerTitle } from './front-layer-directives';
import { MatBackdropButton } from './backdrop-button';


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
    MatFrontlayerTitle
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
    MatFrontlayer
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
