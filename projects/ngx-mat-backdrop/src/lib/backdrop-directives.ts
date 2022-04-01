import { AfterViewInit, Component, Directive, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FrontLayerConfig } from "./front-layer-config";
import { Subscription } from "rxjs";
import { delay } from "rxjs/operators";
import { Backdrop } from "./backdrop";

@Component({
    selector: 'mat-backdrop',
    template: `<ng-content select="mat-backlayer"></ng-content>`,
})
export class MatBackdrop { }

@Directive({
    selector: `mat-backdrop[matBackdropTriggerFor], mat-backdrop[mat-backdrop-trigger-for]`,
    exportAs: 'matBackdropTriggerFor'
})
export class MatBackdropTrigger implements AfterViewInit {

    private _frontLayer: MatFrontlayer | null = null;

    /** References the front layer instance that the trigger is associated with. */
    @Input('matBackdropTriggerFor')
    get frontLayer(): MatFrontlayer | null {
        return this._frontLayer;
    }
    set frontLayer(frontLayer: MatFrontlayer | null) {
        this._frontLayer = frontLayer;
    }

    constructor(
        private _backdrop: Backdrop
    ) { }

    ngAfterViewInit(): void {
        if (this._frontLayer?.templateRef) {
            let _config: FrontLayerConfig = new FrontLayerConfig();

            if (this._frontLayer.name) {
                _config.id = this._frontLayer.name;
            }
            if (this._frontLayer.topPosition) {
                _config.top = this._frontLayer.topPosition;
            }

            this._backdrop.open(this._frontLayer.templateRef, _config);
        }
    }
}

@Component({
    selector: 'mat-backlayer',
    template: `
        <ng-content select="mat-backlayer-title"></ng-content>
        <ng-content select="mat-backlayer-content" *ngIf="showContextMenu"></ng-content>
    `,
    inputs: ['color'],
    host: {
        'class': 'mat-backlayer',
        '[class.mat-backlayer-primary]': 'color === "primary"',
        '[class.mat-backlayer-accent]': 'color === "accent"'
    }
})
export class MatBacklayer implements OnInit, OnDestroy {

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
    selector: 'mat-backlayer-title, [mat-backlayer-title], [matBacklayerTitle]',
    host: { 'class': 'mat-backlayer-title' }
})
export class MatBacklayerTitle { }

@Directive({
    selector: 'mat-backlayer-content, [mat-backlayer-content], [matBacklayerContent]',
    host: { 'class': 'mat-backlayer-content' }
})
export class MatBacklayerContent { }

@Component({
    selector: 'mat-frontlayer',
    template: `<ng-template><ng-content></ng-content></ng-template>`
})
export class MatFrontlayer {
    @ViewChild(TemplateRef) templateRef!: TemplateRef<any>;
    @Input() name: string = 'tmp';
    @Input() topPosition: string = '56px';
}
