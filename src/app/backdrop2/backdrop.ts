import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Directive, Inject, Injectable, InjectionToken, Injector, Optional, TemplateRef, Type } from '@angular/core';
import { FrontLayerConfig } from './front-layer-config';
import { FrontLayerContainer, _FrontLayerContainerBase } from './front-layer-container';
import { FrontLayerRef } from './front-layer-ref';

/** Injection token that can be used to specify default dialog options. */
export const FRONT_LAYER_DEFAULT_OPTIONS =
  new InjectionToken<FrontLayerConfig>('front-layer-default-options');

/**
 * Base class for backdrop services.
 */
@Directive()
export abstract class _BackdropBase<C extends _FrontLayerContainerBase> {

  constructor(
    private _overlay: Overlay,
    private _injector: Injector,
    private _defaultOptions: FrontLayerConfig | undefined,
    private _dialogContainerType: Type<C>
    // private _frontLayerRefConstructor: Type<FrontLayerRef2<any>>
  ) { }

  /**
  * Opens a front-layer containing the given component type or template.
  * @param componentOrTemplateRef ComponentType or TemplateRef to instantiate as the front-layer content.
  * @returns Reference to the newly-opened front-layer.
  */
  open<T, D = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: FrontLayerConfig<D>): FrontLayerRef<T> {

    config = _applyConfigDefaults(config, this._defaultOptions || new FrontLayerConfig());

    const overlayRef = this._createOverlay();
    const frontLayerContainer = this._attachFrontLayerContainer(overlayRef, config);

    const frontLayerRef = this._attachFrontLayerContent<T>(componentOrTemplateRef,
      frontLayerContainer,
      overlayRef,
      config);

    return frontLayerRef;
  }

  /**
   * Creates the overlay into which the front-layer will be loaded.
   * @returns A promise resolving to the OverlayRef for the created overlay.
   */
  private _createOverlay(): OverlayRef {
    const overlayConfig = this._getOverlayConfig();
    return this._overlay.create(overlayConfig);
  }

  /**
   * Creates an default overlay config.
   * @returns The overlay configuration.
   */
  private _getOverlayConfig(): OverlayConfig {
    return new OverlayConfig({
      width: '100%',
      positionStrategy: this._overlay.position().global().top('56px'),
      scrollStrategy: this._overlay.scrollStrategies.block()
    });
  }

  /**
  * Attaches a front-layer container to a dialog's already-created overlay.
  * @param overlay Reference to the dialog's underlying overlay.
  * @returns A promise resolving to a ComponentRef for the attached container.
  */
  private _attachFrontLayerContainer(overlay: OverlayRef,
    config: FrontLayerConfig): C {

    const userInjector = config && config.viewContainerRef && config.viewContainerRef.injector;
    const injector = Injector.create({
      parent: userInjector || this._injector,
      providers: [{ provide: FrontLayerConfig, useValue: config }]
    });

    const containerPortal = new ComponentPortal(this._dialogContainerType,
      config.viewContainerRef, injector, config.componentFactoryResolver);
    const containerRef = overlay.attach<C>(containerPortal);

    return containerRef.instance;
  }

  /**
  * Attaches the user-provided component to the already-created front-layer container.
  * @param componentOrTemplateRef The type of component being loaded into the front-layer,
  *     or a TemplateRef to instantiate as the content.
  * @param frontLayerContainer Reference to the wrapping front-layer container.
  * @param overlayRef Reference to the overlay in which the front-layer resides.
  * @returns A promise resolving to the FrontLayerRef that should be returned to the user.
  */
  private _attachFrontLayerContent<T>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    frontLayerContainer: C,
    overlayRef: OverlayRef,
    config: FrontLayerConfig): FrontLayerRef<T> {

    // const frontLayerRef = new this._frontLayerRefConstructor(overlayRef, frontLayerContainer);
    const frontLayerRef = new FrontLayerRef<T>(overlayRef, frontLayerContainer);

    if (componentOrTemplateRef instanceof TemplateRef) {
      frontLayerContainer.attachTemplatePortal(
        new TemplatePortal<T>(componentOrTemplateRef, null!,
          <any>{ $implicit: config.data, frontLayerRef }));
    } else {
      // TODO: Testen und ViewContainerRef holen und Datenübergabe mit Injector - Frage: Wo kommt die Default Config her?
      // const injector = this._createInjector<T>(config, frontLayerRef, frontLayerContainer);
      const contentRef = frontLayerContainer.attachComponentPortal<T>(
        new ComponentPortal(componentOrTemplateRef, config.viewContainerRef, null));
      frontLayerRef.componentInstance = contentRef.instance;
    }

    return frontLayerRef;
  }

}

@Injectable({
  providedIn: 'root'
})
export class Backdrop extends _BackdropBase<FrontLayerContainer> {

  constructor(
    overlay: Overlay,
    injector: Injector,
    @Optional() @Inject(FRONT_LAYER_DEFAULT_OPTIONS) defaultOptions: FrontLayerConfig
  ) {
    super(overlay, injector, defaultOptions, FrontLayerContainer);
  }
}

/**
 * Applies default options to the dialog config.
 * @param config Config to be modified.
 * @param defaultOptions Default options provided.
 * @returns The new configuration object.
 */
function _applyConfigDefaults(config?: FrontLayerConfig,
  defaultOptions?: FrontLayerConfig): FrontLayerConfig {
  return { ...defaultOptions, ...config };
}
