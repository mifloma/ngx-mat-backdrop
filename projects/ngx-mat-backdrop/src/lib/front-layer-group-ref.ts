import { Observable, Subject, take } from "rxjs";
import { FrontLayerRef, FrontLayerState } from "./front-layer-ref";

export class FrontLayerGroupRef {

    /** Subject for notifying that the active frontlayer of the group has finished droping down. */
    private readonly _afterSwitch = new Subject<FrontLayerRef<any>>();

    /** Subject for notifying the user that the frontlayer group has started closing. */
    private readonly _beforeClose = new Subject<void>();

    constructor(
        private _frontlayers: FrontLayerRef<any>[],
        private _active: number
    ) { }

    switch(active: number): void {
        if (this._frontlayers[this._active].getState() === FrontLayerState.DROPED) {
            this._frontlayers[this._active].afterLift().pipe(take(1)).subscribe(() => this._switch(active));
            this._frontlayers[this._active].lift();
        } else {
            this._switch(active);
        }
    }

    private _switch(active: number): void {
        if (active > this._active) {
            this._frontlayers[this._active].moveLeft();
            this._frontlayers[active].centerFromRight();
            this._active = active;
            this._afterSwitch.next(this._frontlayers[this._active]);
        } else if (active < this._active) {
            this._frontlayers[this._active].moveRight();
            this._frontlayers[active].centerFromLeft();
            this._active = active;
            this._afterSwitch.next(this._frontlayers[this._active]);
        }
    }

    /**
    * Gets an observable that is notified when the front-layer has finished lifting up.
    */
    afterSwitch(): Observable<FrontLayerRef<any>> {
        return this._afterSwitch;
    }

    close(): void {
        this._beforeClose.next();
        this._frontlayers.forEach(frontlayer => frontlayer.close());
    }

    /**
    * Gets an observable that is notified when the frontlayer group starts closing.
    */
    beforeClose(): Observable<void> {
        return this._beforeClose;
    }
}