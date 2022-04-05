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
            // Es werden zu viele eventListener registriert -> z.B. man klickt mehrmals die Buttons
            // FIXME: Nach diesem Lift wirft der Button oben links das close-Event nicht -> Könnte es helfen, wenn es ein _afterList Observable gäbe?
            this._overlayRef.overlayElement.addEventListener('click', this._clickEventListener);
        }

        const top = this._containerInstance._config.top ? this._containerInstance._config.top : '0px';
        this._overlayRef.overlayElement.style.setProperty('--s', top);
        this._overlayRef.overlayElement.style.setProperty('--e', offset);
        this._overlayRef.overlayElement.style.animation = `drop ${AnimationDurations.ENTERING} ${AnimationCurves.STANDARD_CURVE}`;
        this._overlayRef.overlayElement.style.marginTop = offset;

        setTimeout(() => {
            this._state = FrontLayerState.DROPED;
            this._afterDroped.next();
        }, 225);
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

    private _addOffset(offset: number): string {
        var top = 0;
        if (this._containerInstance._config.top) {
            var matches = this._containerInstance._config.top.match(/([0-9])+/g);
            if (matches && matches.length >= 1) {
                top = Number.apply(matches[0]);
            }
        }
        return (top + offset).toString().concat('px');
    }

    /**
     * Unhides the front-layer.
     */
    focus() {
        this._overlayWrapper.style.display = '';
    }

    /**
     * Hides the front-layer without destroying it.
     */
    removeFocus() {
        this._overlayWrapper.style.display = 'none';
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
