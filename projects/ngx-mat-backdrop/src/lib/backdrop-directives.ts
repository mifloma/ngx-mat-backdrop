import { AfterViewInit, Component, ContentChild, Directive, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { merge } from "rxjs";
import { delay, take } from "rxjs/operators";
import { Backdrop } from "./backdrop";
import { BackdropAnimations } from "./backdrop-animations";
import { FrontLayerConfig } from "./front-layer-config";
import { MatFrontlayerGroup } from "./front-layer-directives";
import { FrontLayerRef, FrontLayerState } from "./front-layer-ref";

@Component({
    selector: 'mat-frontlayer',
    template: `<ng-template><ng-content></ng-content></ng-template>`
})
export class MatFrontlayer {
    @ViewChild(TemplateRef) templateRef!: TemplateRef<any>;
    @Input() name!: string;
    @Input() topPosition!: string;
}

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
        // if (this._frontLayer instanceof MatFrontlayerGroup) {
        //     let _config: FrontLayerConfig = new FrontLayerConfig();
        //     let _frontLayerRefs = this._frontLayer._allTabs.map(element => element.templateRef);
        //     this._backdrop.openGroup(_frontLayerRefs, this._frontLayer.active, _config);
        // } else {
        // if (this._frontLayer instanceof MatFrontlayer) {
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
        // }
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
export class MatBacklayer implements OnInit {

    showContextMenu: boolean = false;
    private _frontlayer!: FrontLayerRef<any>;

    constructor(
        private _backdrop: Backdrop
    ) {
        // force refreshing UI in a seperate thread with delay() to avoid 'Expression has changed after it was checked' error
        // merge(this._backdrop.afterOpened(), this._backdrop.afterContentChanged())
        //     .pipe(delay(0), take(1))
        //     .subscribe(() => this.showContextMenu = true);

        // this._backdrop.beforeClosed()
        //     .pipe(take(1))
        //     .subscribe(() => this.showContextMenu = false);

        merge(this._backdrop.afterOpened(), this._backdrop.afterContentChanged(), this._backdrop.afterTabChanged())
            .pipe(delay(0))
            .subscribe(() => {
                let _frontlayer = this._backdrop.getOpenedFrontLayer();
                _frontlayer?.beforeDroped().subscribe(() => this.showContextMenu = true);
                _frontlayer?.afterLift().subscribe(() => this.showContextMenu = false);
            });
    }

    ngOnInit(): void {
        // // force refreshing UI in a seperate thread with delay() to avoid 'Expression has changed after it was checked' error
        // this._afterOpenedSubscription = this._backdrop.afterOpened().pipe(delay(0))
        //     .subscribe(() => this.showContextMenu = true);
        // this._beforeClosedSubscription = this._backdrop.beforeClosed()
        //     .subscribe(() => this.showContextMenu = false);
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
    selector: 'button[mat-backlayer-toggle], button[matBacklayerToggle]',
    animations: [BackdropAnimations.backdropButton],
    template: `
        <ng-container *ngIf="!_opened(); else close">
        <div class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
            <ng-content></ng-content>
        </div>
        </ng-container>
        <ng-template #close>
            <div class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
            </div>
        </ng-template>
    `,
    host: {
        'class': 'mat-backdrop-button',
        '(click)': '_onClick()'
    }
})
export class MatBacklayerToggle implements OnInit {

    @Input() offset: string | 'full' = '200px';

    @Output() open: EventEmitter<void> = new EventEmitter<void>();
    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    _state: 'void' | 'opened' = 'void';

    private _frontLayerRef: FrontLayerRef<any> | undefined;

    constructor(
        private _backdrop: Backdrop
    ) { }

    ngOnInit(): void {
        this._backdrop.afterOpened()
            .pipe(take(1))
            .subscribe(() => this._init());
        this._backdrop.afterTabChanged().subscribe(() => this._init());
        this._backdrop.afterContentChanged()
            .pipe(take(1))
            .subscribe(() => this._init());
    }

    private _init() {
        this._frontLayerRef = this._backdrop.getOpenedFrontLayer();

        this._frontLayerRef?.beforeDroped().subscribe(() => {
            this._state = 'opened';
        });

        this._frontLayerRef?.afterDroped().subscribe(() => {
            this.open.emit();
        });

        this._frontLayerRef?.beforeLift().subscribe(() => {
            this._state = 'void';
        });

        this._frontLayerRef?.afterLift().subscribe(() => {
            this.close.emit();
        });

        if (this.offset === 'full') {
            this.offset = 'calc(100vh - 56px)';
        }
    }

    protected _getFrontLayer(): FrontLayerRef<any> | undefined {
        return this._frontLayerRef;
    }

    _opened(): boolean {
        if (this._frontLayerRef && this._frontLayerRef.getState() === FrontLayerState.DROPED) {
            return true;
        } else {
            return false;
        }
    }

    _onClick(): void {
        if (this._state === 'void') {
            this._frontLayerRef?.drop(this.offset);
        } else {
            this._frontLayerRef?.lift();
        }
    }
}

@Component({
    selector: 'button[mat-backlayer-close], button[matBacklayerClose]',
    animations: [BackdropAnimations.backdropButton],
    template: `
        <ng-container *ngIf="!_opened(); else close">
        <div class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
            <ng-content></ng-content>
        </div>
        </ng-container>
        <ng-template #close>
            <div class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
            </div>
        </ng-template>
    `,
    host: {
        'class': 'mat-backdrop-button',
        '(click)': '_onClick()'
    }
})
export class MatBacklayerClose implements OnInit {

    @Output() close: EventEmitter<void> = new EventEmitter<void>();
    @Output() default: EventEmitter<void> = new EventEmitter<void>();

    _state: 'void' | 'opened' = 'void';

    private _frontLayerRef: FrontLayerRef<any> | undefined;

    constructor(
        private _backdrop: Backdrop
    ) { }

    ngOnInit(): void {
        this._backdrop.afterOpened()
            .pipe(take(1))
            .subscribe(() => this._init());
        this._backdrop.afterContentChanged()
            .pipe(take(1))
            .subscribe(() => this._init());
    }

    private _init() {
        this._frontLayerRef = this._backdrop.getOpenedFrontLayer();

        this._frontLayerRef?.beforeDroped().subscribe(() => {
            this._state = 'opened';
        });

        this._frontLayerRef?.beforeLift().subscribe(() => {
            this._state = 'void';
        });

        this._frontLayerRef?.afterLift().subscribe(() => {
            this.close.emit();
        });
    }

    _opened(): boolean {
        if (this._frontLayerRef && this._frontLayerRef.getState() === FrontLayerState.DROPED) {
            return true;
        } else {
            return false;
        }
    }

    _onClick(): void {
        if (this._state === 'opened') {
            this._frontLayerRef?.lift();
        } else {
            this.default.emit();
        }
    }
}

@Directive({
    selector: `button[mat-backlayer-move], button[matBacklayerMove]`,
    host: {
        'class': 'mat-backlayer-move',
        '(click)': '_onClick()'
    }
})
export class MatBacklayerMove implements OnInit {

    @Input() offset: string | 'full' = '200px';

    @Output() move: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private _backdrop: Backdrop
    ) { }

    ngOnInit(): void {
        if (this.offset === 'full') {
            this.offset = 'calc(100vh - 56px)';
        }
    }

    _onClick(): void {
        let _frontLayerRef = this._backdrop.getOpenedFrontLayer();
        if (_frontLayerRef) {
            if (_frontLayerRef.getState() === FrontLayerState.DROPED) {
                _frontLayerRef.updateDropPosition(this.offset);
            } else {
                _frontLayerRef.drop(this.offset);
            }
            this.move.emit();
        }
    }
}

@Directive({
    selector: 'button[mat-backlayer-switch-tab], button[matBacklayerSwitchTab]',
    host: {
        '(click)': '_onClick()'
    }
})
export class MatBacklayerSwitchTab {

    private _active!: number;

    @Input('mat-backlayer-switch-tab')
    set active(active: number) {
        this._active = active;
    }

    constructor(private _backdrop: Backdrop) { }

    _onClick(): void {
        this._backdrop.getOpenFrontLayerGroup()?.switch(this._active);
    }
}
