import { Component, Directive, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { delay } from "rxjs/operators";
import { Backdrop } from "./backdrop";

@Component({
    selector: 'backdrop-container, [backdrop-container], [backdropContainer]',
    template: `
        <ng-content select="backdrop-title"></ng-content>
        <ng-content select="backdrop-context-menu" *ngIf="showContextMenu"></ng-content>
    `,
    host: { 'class': 'backdrop-container' }
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