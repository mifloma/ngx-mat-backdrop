import { ComponentType, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Directive, EmbeddedViewRef, Injectable, Injector, TemplateRef, Type } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { FrontLayerConfig } from './front-layer-config';
import { MatFrontLayerContainer, _FrontLayerContainerBase } from './front-layer-container';
import { FrontLayerRef } from './front-layer-ref';

/**
 * Base class for backdrop services.
 */
@Directive()
export abstract class _BackdropBase<C extends _FrontLayerContainerBase> {

  private _frontLayerRef!: FrontLayerRef<any>;

  /** Subject for notifying the user that the frontlayer has finished opening. */
  private readonly _afterOpened = new Subject<void>();

  /** Subject for notifying the user that the frontlayer has started closing. */
  private readonly _beforeClosed = new Subject<void>();

  /** Subject for notifiying the user that the content of the frontlayer has been replaced. */
  private readonly _afterContentChanged = new Subject<void>();

  /**
   * Gets an observable that is notified when the front-layer is finished opening.
   */
  afterOpened(): Observable<void> {
    return this._afterOpened;
  }

  /**
   * Gets an observable that is notified when the front-layer has started closing.
   */
  beforeClosed(): Observable<void> {
    return this._beforeClosed;
  }

  /**
   * Gets an observable that is notified when the content the frontlayer has been changed.
   */
  afterContentChanged(): Observable<void> {
    return this._afterContentChanged;
  }

  constructor(
    private _overlay: Overlay,
    private _injector: Injector,
    private _dialogContainerType: Type<C>
  ) { }

  /**
  * Opens a frontlayer containing the given component type or template. If there is already a frontlayer opened, 
  * its content will get replaced with the given component type or template.
  * @param componentOrTemplateRef ComponentType or TemplateRef to instantiate as the frontlayer content.
  * @param config Configuration
  * @returns Reference to the newly-opened frontlayer.
  */
  open<T, D = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: FrontLayerConfig<D>): FrontLayerRef<T> {

    // merge config or create default config
    let _config = config ? FrontLayerConfig.merge(config) : new FrontLayerConfig();

    if (this._frontLayerRef) {
      this._frontLayerRef._containerInstance._animationStateChanged.pipe(
        filter(event => event.state === 'fading')
      ).subscribe(() => {
        this._frontLayerRef._containerInstance.detach();
        this._attachFrontLayerContent(componentOrTemplateRef, this._frontLayerRef);

        this._frontLayerRef._config = _config;
        this._frontLayerRef.updatePosition(_config.top!);

        this._afterContentChanged.next();
      });

      this._frontLayerRef._containerInstance._startFadingAnimation();
      return this._frontLayerRef;
    }

    const overlayRef = this._createOverlay(_config);
    const frontLayerContainer = this._attachFrontLayerContainer(overlayRef, _config);

    const animationStateSubscription = frontLayerContainer._animationStateChanged.pipe(
      filter(event => event.state === 'opened' || event.state === 'closing'),
    ).subscribe(frontLayerAnimationEvent => {
      if (frontLayerAnimationEvent.state === 'opened') {
        this._afterOpened.next();
      } else if (frontLayerAnimationEvent.state === 'closing') {
        this._beforeClosed.next();
        animationStateSubscription.unsubscribe();
      }
    });

    this._frontLayerRef = this._createFrontlayer<T>(componentOrTemplateRef,
      frontLayerContainer,
      overlayRef,
      _config);

    this._frontLayerRef.afterClosed().subscribe(() =>
      this._frontLayerRef = null!
    );

    return this._frontLayerRef;
  }

  /**
   * Creates the overlay into which the front-layer will be loaded.
   * @returns A promise resolving to the OverlayRef for the created overlay.
   */
  private _createOverlay(config: FrontLayerConfig): OverlayRef {
    const overlayConfig = this._getOverlayConfig(config);
    return this._overlay.create(overlayConfig);
  }

  /**
   * Creates an default overlay config.
   * @returns The overlay configuration.
   */
  private _getOverlayConfig(frontLayerConfig: FrontLayerConfig): OverlayConfig {
    let top = frontLayerConfig.elevation ? `calc(${this.getOpenedFrontLayer()?._config.top} + ${frontLayerConfig.top})` : frontLayerConfig.top;

    let _config = new OverlayConfig({
      width: '100%',
      height: 'calc(100vh - ' + top + ')',
      positionStrategy: this._overlay.position().global().top(top),
      scrollStrategy: this._overlay.scrollStrategies.block()
    });

    if (frontLayerConfig.elevation) {
      _config.hasBackdrop = true;
      _config.backdropClass = 'cdk-overlay-transparent-backdrop';
    }

    return _config;
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
  * Creates a new Frontlayer containing the given component type or template.
  * @param componentOrTemplateRef The type of component being loaded into the frontlayer,
  *     or a TemplateRef to instantiate as the content.
  * @param frontLayerContainer Reference to the wrapping frontlayer container.
  * @param overlayRef Reference to the overlay in which the front-layer resides.
  * @returns A FrontLayerRef that should be returned to the user.
  */
  private _createFrontlayer<T>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    frontLayerContainer: C,
    overlayRef: OverlayRef,
    config: FrontLayerConfig): FrontLayerRef<T> {

    let frontLayerRef = new FrontLayerRef<T>(overlayRef, config, frontLayerContainer, config.id);
    this._attachFrontLayerContent<T>(componentOrTemplateRef, frontLayerRef);

    return frontLayerRef;
  }

  /**
   * Attaches a user-provided component to the specified frontlayer.
   * @param componentOrTemplateRef The type of component being loaded into the frontlayer,
  *     or a TemplateRef to instantiate as the content.
   * @param frontLayerRef Reference to the wrapping frontlayer.
   */
  private _attachFrontLayerContent<T>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    frontLayerRef: FrontLayerRef<T>) {

    if (componentOrTemplateRef instanceof TemplateRef) {
      const viewRef = frontLayerRef._containerInstance.attachTemplatePortal(
        new TemplatePortal<T>(componentOrTemplateRef, null!,
          <any>{ $implicit: frontLayerRef._config.data, frontLayerRef }));
      frontLayerRef.viewRef = viewRef;
    } else {
      // TODO: Testen und ViewContainerRef holen und Datenübergabe mit Injector - Frage: Wo kommt die Default Config her?
      // const injector = this._createInjector<T>(config, frontLayerRef, frontLayerContainer);
      const contentRef = frontLayerRef._containerInstance.attachComponentPortal<T>(
        new ComponentPortal(componentOrTemplateRef, frontLayerRef._config.viewContainerRef, null));
      frontLayerRef.componentInstance = contentRef.instance;
      frontLayerRef.viewRef = contentRef.hostView as EmbeddedViewRef<T>;
    }
  }

  /**
   * Finds the current opened front-layer.
   */
  getOpenedFrontLayer(): FrontLayerRef<any> | undefined {
    return this._frontLayerRef;
  }

}

@Injectable()
export class Backdrop extends _BackdropBase<MatFrontLayerContainer> {

  constructor(
    overlay: Overlay,
    injector: Injector,
  ) {
    super(overlay, injector, MatFrontLayerContainer);
  }
}