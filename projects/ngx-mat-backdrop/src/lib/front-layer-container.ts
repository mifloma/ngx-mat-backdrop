import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component, ComponentRef, Directive, EmbeddedViewRef, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { BackdropAnimations } from './backdrop-animations';
import { AnimationEvent } from '@angular/animations';
import { FrontLayerConfig } from './front-layer-config';

/** Event that captures the state of dialog container animations. */
interface FrontLayerAnimationEvent {
  state: 'opened' | 'opening' | 'closing' | 'closed' | 'fading';
  totalTime: number;
}

/**
 * Throws an exception for the case when a ComponentPortal is
 * attached to a DomPortalOutlet without an origin.
 * @docs-private
 */
export function throwFrontLayerContentAlreadyAttachedError() {
  throw Error('Attempting to attach front-layer content after content is already attached');
}

export function throwNoFrontLayerContentAttachedError() {
  throw Error('Attempting to detach front-layer content before any content has attached');
}

@Directive()
export abstract class _FrontLayerContainerBase extends BasePortalOutlet {

  /** Starts the front-layer exit animation. */
  abstract _startExitAnimation(): void;

  /** Starts the front-layer drop animation  **/
  abstract _startDropAnimation(): void;

  /** Starts the front-layer fading animation (fade out)  **/
  abstract _startFadingAnimation(): void;

  abstract _startEnterAnimation(): void;

  /** Emits when an animation state changes. */
  _animationStateChanged = new EventEmitter<FrontLayerAnimationEvent>();

  /** The portal outlet inside of this container into which the dialog content will be loaded. */
  @ViewChild(CdkPortalOutlet, { static: true }) _portalOutlet!: CdkPortalOutlet;

  constructor(
    /** The dialog configuration. */
    public _config: FrontLayerConfig
  ) {
    super();
  }

  /**
  * Attach a ComponentPortal as content to this front-layer container.
  * @param portal Portal to be attached as the front-layer content.
  */
  attachComponentPortal<T>(portal: ComponentPortal<T>): ComponentRef<T> {
    if (this._portalOutlet.hasAttached()) {
      throwFrontLayerContentAlreadyAttachedError();
    }

    return this._portalOutlet.attachComponentPortal(portal);
  }

  /**
   * Attach a TemplatePortal as content to this front-layer container.
   * @param portal Portal to be attached as the front-layer content.
   */
  attachTemplatePortal<C>(portal: TemplatePortal<C>): EmbeddedViewRef<C> {
    if (this._portalOutlet.hasAttached()) {
      throwFrontLayerContentAlreadyAttachedError();
    }

    return this._portalOutlet.attachTemplatePortal(portal);
  }

  override detach(): void {
    if (!this._portalOutlet.hasAttached()) {
      throwNoFrontLayerContentAttachedError();
    }

    this._portalOutlet.detach();
  }
}

@Component({
  selector: 'mat-frontlayer-container',
  templateUrl: './front-layer-container.html',
  styleUrls: ['./backdrop.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [BackdropAnimations.frontLayerContainer, BackdropAnimations.frontLayerContainerOverlay],
  host: {
    'class': 'mat-frontlayer-container',
    '[class.mat-frontlayer-container-elevation]': '_config.elevation',
    '[class.mat-frontlayer-container-transparency]': '_config.transparent',
    '[@frontLayerContainer]': '_state',
    '(@frontLayerContainer.start)': '_onAnimationStart($event)',
    '(@frontLayerContainer.done)': '_onAnimationDone($event)'
  }
})
export class MatFrontLayerContainer extends _FrontLayerContainerBase {

  /** State of the dialog animation. */
  _state: 'void' | 'enter' | 'droped' | 'fading' | 'exit' = 'enter';

  /** Callback, invoked whenever an animation on the host completes. */
  _onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._animationStateChanged.next({ state: 'opened', totalTime: event.totalTime });
    } else if (event.toState === 'exit') {
      this._animationStateChanged.next({ state: 'closed', totalTime: event.totalTime });
    } else if (event.toState === 'fading') {
      this._animationStateChanged.next({ state: 'fading', totalTime: event.totalTime });
      this._state = 'enter';
    }
  }

  /** Callback, invoked when an animation on the host starts. */
  _onAnimationStart(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._animationStateChanged.next({ state: 'opening', totalTime: event.totalTime });
    } else if (event.toState === 'exit' || event.toState === 'void') {
      this._animationStateChanged.next({ state: 'closing', totalTime: event.totalTime });
    }
  }

  /** Starts the dialog exit animation. */
  _startExitAnimation(): void {
    this._state = 'exit';
  }

  _startDropAnimation(): void {
    this._state = 'droped';
  }

  _startFadingAnimation(): void {
    this._state = 'fading';
  }

  _startEnterAnimation(): void {
    this._state = 'enter';
  }

}
