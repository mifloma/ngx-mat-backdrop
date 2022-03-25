import { OverlayRef } from "@angular/cdk/overlay";
import { EmbeddedViewRef } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { filter, take } from 'rxjs/operators';
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
    private readonly _beforeDroped = new Subject<void>()

    /** Subject for notifying that the front-layer has started lifting down. */
    private readonly _beforeLift = new Subject<void>()

    /** Current state of the front-layer. */
    private _state = FrontLayerState.CLOSED;

    /** CDK Overlay Wrapper element of the front-layer */
    private _overlayWrapper: HTMLElement;

    constructor(
        private _overlayRef: OverlayRef,
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
     * @param disable Specifies whether the front-layer should be diabled
     */
    drop(offset: number, disable: boolean): void {
        this._beforeDroped.next();

        if (disable) {
            this.viewRef.rootNodes.forEach((el: HTMLElement) => {
                if (el.style) {
                    el.style.opacity = '50%';
                    el.style.pointerEvents = 'none';
                }
            });
        }

        const top = this._containerInstance._config.top ? this._containerInstance._config.top : '0px';
        this._overlayRef.overlayElement.style.setProperty('--s', top);
        this._overlayRef.overlayElement.style.setProperty('--e', this._addOffset(offset));
        this._overlayRef.overlayElement.style.animation = 'drop 0.25s ease-in-out';
        this._overlayRef.overlayElement.style.marginTop = this._addOffset(offset);

        setTimeout(() => {
            this._state = FrontLayerState.DROPED;
        }, 250);
    }

    updateDropPosition(offset: number): void {
        if (this._state == FrontLayerState.DROPED) {
            const top = this._containerInstance._config.top ? this._containerInstance._config.top : '0px';
            this._overlayRef.overlayElement.style.marginTop = this._addOffset(offset);
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
        this._overlayRef.overlayElement.style.animation = 'lift 0.25s ease-in-out';
        this._overlayRef.overlayElement.style.marginTop = top;

        setTimeout(() => {
            this.viewRef.rootNodes.forEach((el: HTMLElement) => {
                if (el.style) {
                    el.style.opacity = '';
                    el.style.pointerEvents = '';
                }
            });
            this._state = FrontLayerState.OPEN;
        }, 250);
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
    * Gets an observable that is notified when the front-layer has started lifting up.
    */
    beforeLift(): Observable<void> {
        return this._beforeLift;
    }
}
