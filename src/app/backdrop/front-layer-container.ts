import { BasePortalOutlet, CdkPortalOutlet, ComponentPortal, TemplatePortal } from '@angular/cdk/portal';
import { Component, ComponentRef, Directive, EmbeddedViewRef, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { BackdropAnimations } from './backdrop-animations';
import { AnimationEvent } from '@angular/animations';
import { FrontLayerConfig } from './front-layer-config';

/** Event that captures the state of dialog container animations. */
interface FrontLayerAnimationEvent {
  state: 'opened' | 'opening' | 'closing' | 'closed';
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

@Directive()
export abstract class _FrontLayerContainerBase extends BasePortalOutlet {

  /** Starts the dialog exit animation. */
  abstract _startExitAnimation(): void;

  abstract _startDropAnimation(): void;

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
}

@Component({
  selector: 'front-layer-container',
  templateUrl: './front-layer-container.html',
  styleUrls: ['./backdrop.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [BackdropAnimations.frontLayerContainer],
  host: {
    'class': 'front-layer-container',
    '[@frontLayerContainer]': '_state',
    '(@frontLayerContainer.start)': '_onAnimationStart($event)',
    '(@frontLayerContainer.done)': '_onAnimationDone($event)',
  }
})
export class FrontLayerContainer extends _FrontLayerContainerBase {

  /** State of the dialog animation. */
  _state: 'void' | 'enter' | 'droped' | 'exit' = 'enter';

  /** Callback, invoked whenever an animation on the host completes. */
  _onAnimationDone(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._animationStateChanged.next({ state: 'opened', totalTime: event.totalTime });
    } else if (event.toState === 'exit') {
      this._animationStateChanged.next({ state: 'closed', totalTime: event.totalTime });
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
}
