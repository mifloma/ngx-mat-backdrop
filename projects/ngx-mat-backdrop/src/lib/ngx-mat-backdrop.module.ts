import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Backdrop } from './backdrop';
import { MatBackdrop, MatBackdropTrigger, MatBacklayer, MatBacklayerClose, MatBacklayerCloseAnchor, MatBacklayerContent, MatBacklayerMove, MatBacklayerSwitchTab, MatBacklayerTitle, MatBacklayerToggle, MatFrontlayer } from './backdrop-directives';
import { MatFrontLayerContainer } from './front-layer-container';
import { MatFrontlayerActions, MatFrontLayerClose, MatFrontlayerContent, MatFrontlayerDrop, MatFrontlayerGroup, MatFrontlayerTitle } from './front-layer-directives';


@NgModule({
  declarations: [
    MatBackdrop,
    MatBackdropTrigger,
    MatBacklayer,
    MatBacklayerTitle,
    MatBacklayerToggle,
    MatBacklayerClose,
    MatBacklayerCloseAnchor,
    MatBacklayerMove,
    MatBacklayerSwitchTab,
    MatBacklayerContent,
    MatFrontlayer,
    MatFrontlayerGroup,
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
    MatBacklayerCloseAnchor,
    MatBacklayerMove,
    MatBacklayerSwitchTab,
    MatBacklayerContent,
    MatFrontlayerContent,
    MatFrontlayerTitle,
    MatFrontlayerActions,
    MatBackdrop,
    MatFrontlayer,
    MatFrontlayerGroup,
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
