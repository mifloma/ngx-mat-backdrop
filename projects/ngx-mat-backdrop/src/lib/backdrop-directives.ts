import { animate, state, style, transition, trigger } from "@angular/animations";
import { Component, Directive, Input, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { delay, take } from "rxjs/operators";
import { Backdrop } from "./backdrop";
import { BackdropAnimations } from "./backdrop-animations";
import { FrontLayerRef, FrontLayerState } from "./front-layer-ref";

@Component({
    selector: 'backdrop-container, [backdrop-container], [backdropContainer]',
    template: `
        <ng-content select="backdrop-title"></ng-content>
        <ng-content select="backdrop-context-menu" *ngIf="showContextMenu"></ng-content>
    `,
    inputs: ['color'],
    host: {
        'class': 'backdrop-container',
        '[class.backdrop-container-primary]': 'color === "primary"',
        '[class.backdrop-container-accent]': 'color === "accent"'
    }
})
export class BackdropContainer implements OnInit, OnDestroy {

    showContextMenu: boolean = false;

    private _afterOpenedSubscription: Subscription;
    private _beforeClosedSubscription: Subscription;

    constructor(
        private _backdrop: Backdrop
    ) {
        // force refreshing UI in a seperate thread with delay() to avoid 'Expression has changed after it was checked' error
        this._afterOpenedSubscription = this._backdrop.afterOpened().pipe(delay(0))
            .subscribe(() => this.showContextMenu = true);
        this._beforeClosedSubscription = this._backdrop.beforeClosed()
            .subscribe(() => this.showContextMenu = false);
    }

    ngOnInit(): void {
        // // force refreshing UI in a seperate thread with delay() to avoid 'Expression has changed after it was checked' error
        // this._afterOpenedSubscription = this._backdrop.afterOpened().pipe(delay(0))
        //     .subscribe(() => this.showContextMenu = true);
        // this._beforeClosedSubscription = this._backdrop.beforeClosed()
        //     .subscribe(() => this.showContextMenu = false);
    }

    ngOnDestroy(): void {
        this._afterOpenedSubscription.unsubscribe();
        this._beforeClosedSubscription.unsubscribe();
    }

}

@Directive({
    selector: 'backdrop-title, [backdrop-title], [backdropTitle]',
    host: { 'class': 'backdrop-title' }
})
export class BackdropTitle { }

@Directive({
    selector: 'backdrop-context-menu, [backdrop-context-menu], [backdropContextMenu]',
    host: { 'class': 'backdrop-context-menu' }
})
export class BackdropContextMenu { }
