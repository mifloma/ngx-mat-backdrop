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
  ],
  exports: [
    BackdropContainer,
    BackdropTitle,
    BackdropContextMenu,
    FrontLayerContainer,
    FrontLayerContent,
    FrontLayerTitle,
  ]
})
export class NgxMatBackdropModule {
  static forRoot(): ModuleWithProviders<NgxMatBackdropModule> {
    return {
      ngModule: NgxMatBackdropModule,
      providers: [Backdrop]
    }
  }
}
