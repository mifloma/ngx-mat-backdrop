import { OverlayRef } from "@angular/cdk/overlay";
import { EmbeddedViewRef } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { filter, take } from 'rxjs/operators';
import { AnimationCurves, AnimationDurations } from "./backdrop-animations";
import { FrontLayerConfig } from "./front-layer-config";
import { _FrontLayerContainerBase } from "./front-layer-container";

// Counter for unique dialog ids.
let uniqueId = 0;

/** Possible states of the lifecycle of a front-layer. */
export const enum FrontLayerState { OPEN, DROPED, CLOSING, CLOSED }

export class FrontLayerRef<T> {

    /** The instance of component opened into the front-layer. */
    componentInstance!: T;

    /** A viewRef of the component opened into the front-layer  */
    viewRef!: EmbeddedViewRef<T>;

    /** Subject for notifying the user that the front-layer has finished closing. */
    private readonly _afterClosed = new Subject<void>();

    /** Subject for notifying that the front-layer has started droping down. */
    private readonly _beforeDroped = new Subject<void>();

    /** Subject for notifying that the front-layer has finished droping down. */
    private readonly _afterDroped = new Subject<void>();

    /** Subject for notifying that the front-layer has started lifting up. */
    private readonly _beforeLift = new Subject<void>();

    /** Subject for notifying that the front-layer has finished lifting up. */
    private readonly _afterLift = new Subject<void>();

    /** Current state of the front-layer. */
    private _state = FrontLayerState.CLOSED;

    /** CDK Overlay Wrapper element of the front-layer */
    private _overlayWrapper: HTMLElement;

    /** This listener reacts on clicks on a droped front layer to lift it */
    private _clickEventListener: EventListener = () => this.lift();

    constructor(
        private _overlayRef: OverlayRef,
        public _config: FrontLayerConfig,
        public _containerInstance: _FrontLayerContainerBase,
        readonly id: string = `front-layer-${uniqueId++}`
    ) {
        _containerInstance._animationStateChanged.pipe(
            filter(event => event.state === 'opened'),
            take(1)
        ).subscribe(() => {
            this._state = FrontLayerState.OPEN;
        });

        _overlayRef.detachments().subscribe(() => {
            this._afterClosed.next();
        });

        this._overlayWrapper = _overlayRef.hostElement;
    }

    moveLeft() {
        this._resetOverlayAnimation();

        this._overlayRef.overlayElement.style.setProperty('--s', '0');
        this._overlayRef.overlayElement.style.setProperty('--e', 'calc(-100% - 24px)');
        this._overlayRef.overlayElement.style.animation = `translate ${AnimationDurations.ENTERING} ${AnimationCurves.STANDARD_CURVE}`;
        this._overlayRef.overlayElement.style.transform = 'translateX(calc(-100% - 24px))';
    }

    centerFromRight() {
        this._resetOverlayAnimation();

        this._overlayRef.overlayElement.style.setProperty('--s', 'calc(100% + 24px)');
        this._overlayRef.overlayElement.style.setProperty('--e', '0');
        this._overlayRef.overlayElement.style.animation = `translate ${AnimationDurations.ENTERING} ${AnimationCurves.STANDARD_CURVE}`;
        this._overlayRef.overlayElement.style.transform = 'none';
    }

    centerFromLeft() {
        this._resetOverlayAnimation();

        this._overlayRef.overlayElement.style.setProperty('--s', 'calc(-100% - 24px)');
        this._overlayRef.overlayElement.style.setProperty('--e', '0');
        this._overlayRef.overlayElement.style.animation = `translate ${AnimationDurations.ENTERING} ${AnimationCurves.STANDARD_CURVE}`;
        this._overlayRef.overlayElement.style.transform = 'none';
    }

    moveRight() {
        this._resetOverlayAnimation();

        this._overlayRef.overlayElement.style.setProperty('--s', '0');
        this._overlayRef.overlayElement.style.setProperty('--e', 'calc(100% + 24px)');
        this._overlayRef.overlayElement.style.animation = `translate ${AnimationDurations.ENTERING} ${AnimationCurves.STANDARD_CURVE}`;
        this._overlayRef.overlayElement.style.transform = 'translateX(calc(100% + 24px))';
    }

    /**
     * Move the front-layer by the specified offset
     * @param offset The distance by which the plane is to be moved
     */
    drop(offset: string): void {
        this._beforeDroped.next();

        if (this._config.disableOnDrop) {
            this.viewRef.rootNodes.forEach((el: HTMLElement) => {
                if (el.style) {
                    el.style.opacity = '50%';
                    el.style.pointerEvents = 'none';
                }
            });
        }

        const top = this._containerInstance._config.top ? this._containerInstance._config.top : '0px';
        this._overlayRef.overlayElement.style.setProperty('--s', top);
        this._overlayRef.overlayElement.style.setProperty('--e', offset);
        this._overlayRef.overlayElement.style.animation = `drop ${AnimationDurations.ENTERING} ${AnimationCurves.STANDARD_CURVE}`;
        this._overlayRef.overlayElement.style.marginTop = offset;

        setTimeout(() => {
            this._state = FrontLayerState.DROPED;
            this._afterDroped.next();
            // lift frontlayer if user clicks on it
            this._overlayRef.overlayElement.addEventListener('click', this._clickEventListener);
        }, 225);
    }

    updatePosition(top: string): void {
        this._resetOverlayAnimation();

        const _oldTop = this._overlayRef.overlayElement.style.marginTop ? this._overlayRef.overlayElement.style.marginTop : '0px';
        if (_oldTop < top) {
            this._overlayRef.overlayElement.style.height = `calc(100vh - ${top})`;
        }

        this._overlayRef.overlayElement.style.setProperty('--s', _oldTop);
        this._overlayRef.overlayElement.style.setProperty('--e', top);
        this._overlayRef.overlayElement.style.animation = `move ${AnimationDurations.EXITING} ${AnimationCurves.STANDARD_CURVE}`;

        setTimeout(() => {
            this._overlayRef.overlayElement.style.marginTop = top;
            this._overlayRef.overlayElement.style.height = `calc(100vh - ${top})`;
        }, 195);
    }

    private _resetOverlayAnimation() {
        this._overlayRef.overlayElement.style.animation = 'none'; // remove last animation
        void this._overlayRef.overlayElement.offsetHeight; // trigger DOM reflow
        this._overlayRef.overlayElement.style.animation = null!;
    }

    updateDropPosition(offset: string): void {
        if (this._state == FrontLayerState.DROPED) {
            const top = this._overlayRef.overlayElement.style.marginTop ? this._overlayRef.overlayElement.style.marginTop : '0px';
            this._overlayRef.overlayElement.style.setProperty('--s', top);
            this._overlayRef.overlayElement.style.setProperty('--e', offset);
            this._overlayRef.overlayElement.style.animation = `move ${AnimationDurations.EXITING} ${AnimationCurves.STANDARD_CURVE}`;
            this._overlayRef.overlayElement.style.marginTop = offset;

            // setTimeout(() => {
            // }, 195);
        }
    }

    /**
     * Move the front-layer back to its original position
     */
    lift() {
        this._beforeLift.next();

        const top = this._containerInstance._config.top ? this._containerInstance._config.top : '0px';
        const offset = this._overlayRef.overlayElement.style.marginTop;
        this._overlayRef.overlayElement.style.setProperty('--s', offset);
        this._overlayRef.overlayElement.style.setProperty('--e', top);
        this._overlayRef.overlayElement.style.animation = `lift ${AnimationDurations.EXITING} ${AnimationCurves.STANDARD_CURVE}`;
        this._overlayRef.overlayElement.style.marginTop = top;

        this._overlayRef.overlayElement.removeEventListener('click', this._clickEventListener);

        setTimeout(() => {
            this.viewRef.rootNodes.forEach((el: HTMLElement) => {
                if (el.style) {
                    el.style.opacity = '';
                    el.style.pointerEvents = '';
                }
            });
            this._state = FrontLayerState.OPEN;
            this._afterLift.next();
        }, 195);
    }

    /**
    * Close the front-layer.
    */
    close() {
        this._containerInstance._animationStateChanged.pipe(
            filter(event => event.state === 'closing'),
            take(1)
        ).subscribe(event => {
            this._overlayRef.detachBackdrop();
            setTimeout(() => this._finishFrontLayerClose(), event.totalTime);
        });

        this._state = FrontLayerState.CLOSING;
        this._containerInstance._startExitAnimation();
    }

    private _finishFrontLayerClose() {
        this._state = FrontLayerState.CLOSED;
        this._overlayRef.dispose();
    }

    /** Gets the current state of the dialog's lifecycle. */
    getState(): FrontLayerState {
        return this._state;
    }

    /**
    * Gets an observable that is notified when the front-layer is finished closing.
    */
    afterClosed(): Observable<void> {
        return this._afterClosed;
    }

    /**
    * Gets an observable that is notified when the front-layer has started droping down.
    */
    beforeDroped(): Observable<void> {
        return this._beforeDroped;
    }

    /**
    * Gets an observable that is notified when the front-layer has finished droping down.
    */
    afterDroped(): Observable<void> {
        return this._afterDroped;
    }

    /**
    * Gets an observable that is notified when the front-layer has started lifting up.
    */
    beforeLift(): Observable<void> {
        return this._beforeLift;
    }

    /**
    * Gets an observable that is notified when the front-layer has finished lifting up.
    */
    afterLift(): Observable<void> {
        return this._afterLift;
    }
}
