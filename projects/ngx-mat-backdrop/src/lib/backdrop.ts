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

  private _openFrontLayers: FrontLayerRef<any>[] = [];
  private _lastFrontLayerRef!: FrontLayerRef<any>;
  private _overlayRef!: OverlayRef;
  private _containerRef!: C;

  /** Subject for notifying the user that the frontlayer has finished opening. */
  private readonly _afterOpened = new Subject<void>();

  /** Subject for notifying the user that the frontlayer has started closing. */
  private readonly _beforeClosed = new Subject<void>();

  /** Subject for notifiying the user that the content of the frontlayer has been replaced. */
  private readonly _afterContentChanged = new Subject<void>();

  /** Subject for notifying the user that one of multiple opened font-layers got focused */
  private readonly _afterFocusChanged = new Subject<FrontLayerRef<any>>();

  /** Keeps track of the currently-open front-layers. */
  get openFrontLayers(): FrontLayerRef<any>[] {
    return this._openFrontLayers;
  }

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

  /**
   * Gets an obserable that is notified when one of multiple opened front-layers got focused.
   */
  afterFocusChanged(): Observable<FrontLayerRef<any>> {
    return this._afterFocusChanged;
  }

  constructor(
    private _overlay: Overlay,
    private _injector: Injector,
    private _dialogContainerType: Type<C>
  ) { }

  private _focus(frontLayerRef: FrontLayerRef<any>): void {
    frontLayerRef.focus();
    this._openFrontLayers.filter(layer => layer.id != frontLayerRef.id).forEach(e => e.removeFocus());
  }

  /**
  * Opens a front-layer containing the given component type or template.
  * @param componentOrTemplateRef ComponentType or TemplateRef to instantiate as the front-layer content.
  * @returns Reference to the newly-opened front-layer.
  */
  open<T, D = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config?: FrontLayerConfig<D>): FrontLayerRef<T> {

    config = config ? FrontLayerConfig.merge(config) : new FrontLayerConfig();

    if (this._lastFrontLayerRef) {
      this._containerRef._animationStateChanged.pipe(
        filter(event => event.state === 'fading')
      ).subscribe(() => {
        this._lastFrontLayerRef._containerInstance.detach(); // FIXME: Wirft exception wenn nicht attached
        const frontLayerRef = this._attachFrontLayerContent<T>(componentOrTemplateRef,
          this._containerRef,
          this._overlayRef,
          this._lastFrontLayerRef._config); // Warum nicht neue Config?
        this._lastFrontLayerRef = frontLayerRef; // Warum?
        this._afterContentChanged.next();
      });

      this._containerRef._startFadingAnimation();
      return this._lastFrontLayerRef;
    }

    const overlayRef = this._createOverlay(config);
    const frontLayerContainer = this._attachFrontLayerContainer(overlayRef, config);

    const animationStateSubscription = frontLayerContainer._animationStateChanged.pipe(
      filter(event => event.state === 'opened' || event.state === 'closing'),
    ).subscribe(frontLayerAnimationEvent => {
      if (frontLayerAnimationEvent.state === 'opened') {
        if (!config?.elevation) {
          // Don`t hide other front layers if the new layer is a popover to see elevation effect
          this._hideNoneFocusedFrontLayers<T>(frontLayerRef);
        }
        this._afterOpened.next();
      } else if (frontLayerAnimationEvent.state === 'closing') {
        if (!config?.elevation) {
          // Don`t throw beforeClosed event if the new layer is a popover because there is at least one more front layer left
          // FIXME: Not a good solution -> better use different event type 
          this._unhideNextFrontLayerOnStack<T>(frontLayerRef);
          this._beforeClosed.next();
        }
        animationStateSubscription.unsubscribe();
      }
    });

    const frontLayerRef = this._attachFrontLayerContent<T>(componentOrTemplateRef,
      frontLayerContainer,
      overlayRef,
      config);

    this._overlayRef = overlayRef;
    this._containerRef = frontLayerContainer;
    this._lastFrontLayerRef = frontLayerRef;
    this._openFrontLayers.push(frontLayerRef);
    frontLayerRef.afterClosed().subscribe(() => this._removeOpenDialog(frontLayerRef));

    return frontLayerRef;
  }

  /**
   * Hides all front-layers except the currently opened one.
   * @param currentlyOpenedFrontLayerRef The currently opened front-layer
   */
  private _hideNoneFocusedFrontLayers<T>(currentlyOpenedFrontLayerRef: FrontLayerRef<T>): void {
    this._openFrontLayers.filter(layer => layer.id != currentlyOpenedFrontLayerRef.id)
      .forEach(layer => layer.removeFocus());
  }

  /**
   * Takes the next front-layer on the stack behind the currently opened one and makes it visible.
   * @param currentlyOpenedFrontLayerRef The currently opened front-layer
   */
  private _unhideNextFrontLayerOnStack<T>(currentlyOpenedFrontLayerRef: FrontLayerRef<T>): void {
    const hiddenFrontLayers = this._openFrontLayers.filter(layer => layer.id != currentlyOpenedFrontLayerRef.id);
    if (hiddenFrontLayers.length >= 1) {
      hiddenFrontLayers[hiddenFrontLayers.length - 1].focus();
    }
  }

  /**
   * Finds an open front-layer by its id.
   * @param id ID to use when looking up the front-layer.
   */
  getFrontLayerById(id: string) {
    return this._openFrontLayers.find(frontLayer => frontLayer.id === id);
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

    const frontLayerRef = new FrontLayerRef<T>(overlayRef, config, frontLayerContainer, config.id);

    if (componentOrTemplateRef instanceof TemplateRef) {
      const viewRef = frontLayerContainer.attachTemplatePortal(
        new TemplatePortal<T>(componentOrTemplateRef, null!,
          <any>{ $implicit: config.data, frontLayerRef }));
      frontLayerRef.viewRef = viewRef;
    } else {
      // TODO: Testen und ViewContainerRef holen und Datenübergabe mit Injector - Frage: Wo kommt die Default Config her?
      // const injector = this._createInjector<T>(config, frontLayerRef, frontLayerContainer);
      const contentRef = frontLayerContainer.attachComponentPortal<T>(
        new ComponentPortal(componentOrTemplateRef, config.viewContainerRef, null));
      frontLayerRef.componentInstance = contentRef.instance;
      frontLayerRef.viewRef = contentRef.hostView as EmbeddedViewRef<T>; // Does this work?
    }

    return frontLayerRef;
  }

  /**
   * Finds the current opened front-layer.
   */
  getOpenedFrontLayer(): FrontLayerRef<any> | undefined {
    return this._lastFrontLayerRef;
  }

  /**
   * Removes a front layer from the array of open front layers.
   * @param dialogRef Dialog to be removed.
   */
  private _removeOpenDialog(frontLayerRef: FrontLayerRef<any>) {
    let index = this._openFrontLayers.indexOf(frontLayerRef);

    // reactivate next layer on the stack, if closing layer was a popover
    if (frontLayerRef._config.elevation === true && index >= 1) {
      this._lastFrontLayerRef = this._openFrontLayers[index - 1];
    }

    if (index > -1) {
      this._openFrontLayers.splice(index, 1);
    }
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