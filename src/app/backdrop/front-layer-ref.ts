import { OverlayRef } from "@angular/cdk/overlay";
import { EmbeddedViewRef, ViewRef } from "@angular/core";
import { filter, take } from 'rxjs/operators';
import { _FrontLayerContainerBase } from "./front-layer-container";

/** Possible states of the lifecycle of a front-layer. */
export const enum FrontLayerState { OPEN, DROPED, CLOSING, CLOSED }

export class FrontLayerRef<T> {

    /** The instance of component opened into the front-layer. */
    componentInstance!: T;

    /** A viewRef of the component opened into the front-layer  */
    viewRef!: EmbeddedViewRef<T>;

    popupRef!: FrontLayerRef<any>;
    parentRef!: FrontLayerRef<any>;

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
        if (!this.popupRef) {
            const top = this._containerInstance._config.top ? this._containerInstance._config.top : '0px';
            this._overlayRef.overlayElement.style.setProperty('--s', top);
            this._overlayRef.overlayElement.style.setProperty('--e', this.addOffset(offset));
            this._overlayRef.overlayElement.style.animation = 'drop 0.25s ease-in-out';
            this._overlayRef.overlayElement.style.marginTop = this.addOffset(offset);

            setTimeout(() => {
                if (disable) {
                    this.viewRef.rootNodes.forEach((el: HTMLElement) => {
                        el.style.opacity = '50%';
                        el.style.pointerEvents = 'none';
                    });
                }
                this._state = FrontLayerState.DROPED;
            }, 250);
        }
    }

    private addOffset(offset: number): string {
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
     * Move the front-layer back to its original position
     */
    lift() {
        if (!this.popupRef) {
            const top = this._containerInstance._config.top ? this._containerInstance._config.top : '0px';
            const offset = this._overlayRef.overlayElement.style.marginTop;
            this._overlayRef.overlayElement.style.setProperty('--s', offset);
            this._overlayRef.overlayElement.style.setProperty('--e', top);
            this._overlayRef.overlayElement.style.animation = 'lift 0.25s ease-in-out';
            this._overlayRef.overlayElement.style.marginTop = top;

            this.viewRef.rootNodes.forEach((el: HTMLElement) => {
                el.style.opacity = '';
                el.style.pointerEvents = '';
            });

            setTimeout(() => {
                this._state = FrontLayerState.OPEN;
            }, 250);
        }
    }

    /**
    * Close the front-layer.
    */
    close() {
        if (this.popupRef) {
            this.popupRef.close();
            this.popupRef = null!;
        } else {

            this._containerInstance._animationStateChanged.pipe(
                filter(event => event.state === 'closing'),
                take(1)
            ).subscribe(event => {
                this._overlayRef.detachBackdrop();
                setTimeout(() => this._finishFrontLayerClose(), event.totalTime);
            });

            this._state = FrontLayerState.CLOSING;
            this._containerInstance._startExitAnimation();

            if (this.parentRef) {
                this.parentRef.popupRef = null!;
            }
        }
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
