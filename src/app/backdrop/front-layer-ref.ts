import { OverlayRef } from "@angular/cdk/overlay";
import { _FrontLayerContainerBase } from "./front-layer-container";
import { filter, take } from 'rxjs/operators';

/** Possible states of the lifecycle of a front-layer. */
export const enum FrontLayerState { OPEN, DROPED, CLOSING, CLOSED }

export class FrontLayerRef<T> {

    /** The instance of component opened into the front-layer. */
    componentInstance!: T;

    /** Current state of the front-layer. */
    private _state = FrontLayerState.CLOSED;

    constructor(
        private _overlayRef: OverlayRef,
        private _containerInstance: _FrontLayerContainerBase
    ) {
        _containerInstance._animationStateChanged.pipe(
            filter(event => event.state === 'opened'),
            take(1)
        ).subscribe(() => {
            this._state = FrontLayerState.OPEN;
        });
    }

    /**
     * Move the front-layer by the specified offset
     * @param offset The distance by which the plane is to be moved
     * @param disable Specifies whether the front-layer should be diabled
     */
    drop(offset: number, disable: boolean): void {
        // this._overlayRef.overlayElement.style.setProperty('--s', '56px');
        // this._overlayRef.overlayElement.style.setProperty('--e', (56 + offset).toString() + 'px');
        // this._overlayRef.overlayElement.style.animation = 'drop 0.25s ease-in-out';
        // this._overlayRef.overlayElement.style.marginTop = (56 + offset).toString() + 'px';

        this._containerInstance._startDropAnimation();

        setTimeout(() => {
            if (disable) {
                this._overlayRef.overlayElement.style.opacity = '50%';
                this._overlayRef.overlayElement.style.pointerEvents = 'none';
            }
            this._state = FrontLayerState.DROPED;
        }, 250);
    }

    /**
     * Move the front-layer back to its original position
     */
    lift() {
        const offset = this._overlayRef.overlayElement.style.marginTop;
        this._overlayRef.overlayElement.style.setProperty('--s', offset);
        this._overlayRef.overlayElement.style.setProperty('--e', '56px');
        this._overlayRef.overlayElement.style.animation = 'lift 0.25s ease-in-out';
        this._overlayRef.overlayElement.style.marginTop = '56px';
        this._overlayRef.overlayElement.style.opacity = '';
        this._overlayRef.overlayElement.style.pointerEvents = '';
        setTimeout(() => {
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
            console.log('detach backdrop');
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
}
