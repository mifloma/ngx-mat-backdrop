import { FocusableOption, FocusMonitor, FocusOrigin, FocusTrap, FocusTrapFactory, LiveAnnouncer } from "@angular/cdk/a11y";
import { _getFocusedElementPierceShadowDom } from "@angular/cdk/platform";
import { DOCUMENT } from "@angular/common";
import { AfterViewInit, Component, Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output, TemplateRef, ViewChild } from "@angular/core";
import { merge, race, Subscription } from "rxjs";
import { delay, take } from "rxjs/operators";
import { Backdrop } from "./backdrop";
import { BackdropAnimations } from "./backdrop-animations";
import { FrontLayerConfig } from "./front-layer-config";
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

    private _document: Document;

    /** The class that traps and manages focus within the backlayer. */
    private _focusTrap!: FocusTrap;

    /** Element that was focused before the backlayer was revealed. Save this to restore upon close. */
    private _elementFocusedBeforeDialogWasOpened: HTMLElement | null = null;

    /**
   * Type of interaction that led to the dialog being closed. This is used to determine
   * whether the focus style will be applied when returning focus to its original location
   * after the dialog is closed.
   */
    _closeInteractionType: FocusOrigin | null = null;

    constructor(
        @Optional() @Inject(DOCUMENT) _document: any,
        private _backdrop: Backdrop,
        private _element: ElementRef,
        private _focusMonitor: FocusMonitor,
        private _focusTrapFactory: FocusTrapFactory,
        private _liveAnnouncer: LiveAnnouncer
    ) {
        // force refreshing UI in a seperate thread with delay() to avoid 'Expression has changed after it was checked' error
        // merge(this._backdrop.afterOpened(), this._backdrop.afterContentChanged())
        //     .pipe(delay(0), take(1))
        //     .subscribe(() => this.showContextMenu = true);

        // this._backdrop.beforeClosed()
        //     .pipe(take(1))
        //     .subscribe(() => this.showContextMenu = false);

        this._document = _document;

        merge(this._backdrop.afterOpened(), this._backdrop.afterContentChanged(), this._backdrop.afterTabChanged())
            .pipe(delay(0))
            .subscribe(() => {
                let _frontlayer = this._backdrop.getOpenedFrontLayer();
                _frontlayer?.beforeDroped().subscribe(() => {
                    this._liveAnnouncer.announce('Context menu revealed');
                    this.showContextMenu = true;
                    // FIXME: you can'ct rely on setTImeout, there is no guarantee the DOM will be rendered when the setTImeout callback is called
                    // See: https://stackoverflow.com/questions/50743396/get-children-of-parent-element-after-ngif-angular-5
                    setTimeout(() => this._trapFocus(_frontlayer!));
                });
                _frontlayer?.afterLift().subscribe(() => {
                    this._liveAnnouncer.announce('Context menu concealed');
                    this.showContextMenu = false;
                    setTimeout(() => this._restoreFocus(_frontlayer!));
                });
            });
    }

    private _trapFocus(_frontlayer: FrontLayerRef<any>) {
        this._focusTrap = this._focusTrapFactory.create(this._element.nativeElement);

        // Save the previously focused element. This element will be re-focused when the backlayer conceales
        if (this._document) {
            this._elementFocusedBeforeDialogWasOpened = _getFocusedElementPierceShadowDom();
        }

        let _autoFocus = _frontlayer._config.autoFocus;
        if (typeof _autoFocus === 'string') {
            this._focusByCssSelector(_autoFocus);
        } else if (_autoFocus === true) {
            this._focusTrap.focusInitialElementWhenReady().then(success => {
                if (!success) {
                    this._element.nativeElement.focus();
                }
            });
        }
    }

    private _restoreFocus(_frontlayer: FrontLayerRef<any>) {
        this._focusTrap.destroy();

        let _restoreFocus = _frontlayer._config.restoreFocus;
        let _focusTargetElement!: HTMLElement | null;

        if (typeof _restoreFocus === 'string') {
            _focusTargetElement = _frontlayer._containerInstance._elementRef.nativeElement
                .querySelector(_restoreFocus) as HTMLElement | null;
        } else if (_restoreFocus === true) {
            _focusTargetElement = _frontlayer._containerInstance._elementRef.nativeElement
                .querySelector('h1, h2, h3, h4, h5, h6, [role="heading"]') as HTMLElement | null;
            if (_focusTargetElement == null) {
                _focusTargetElement = this._getFirstTabbable(_frontlayer);
            }
        }

        if (_focusTargetElement == null) {
            _focusTargetElement = _frontlayer._containerInstance._elementRef.nativeElement;
        }

        this._focusMonitor.focusVia(_focusTargetElement!, this._closeInteractionType);
        this._closeInteractionType = null;
    }

    private _getFirstTabbable(_frontlayer: FrontLayerRef<any>): HTMLElement | null {
        let _tabbables = _frontlayer._containerInstance._elementRef.nativeElement
            .querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (_tabbables && _tabbables.length > 0) {
            return _tabbables[0];
        } else {
            return null;
        }
    }

    /**
   * Focuses the first element that matches the given selector within the focus trap.
   * @param selector The CSS selector for the element to set focus to.
   */
    private _focusByCssSelector(selector: string, options?: FocusOptions) {
        let elementToFocus = this._element.nativeElement.querySelector(
            selector,
        ) as HTMLElement | null;

        if (elementToFocus == null) {
            elementToFocus = this._element.nativeElement;
        }

        elementToFocus?.focus();
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
    host: {
        'class': 'mat-backlayer-title',
        '[attr.role]': '"navigation"'
    }
})
export class MatBacklayerTitle { }

@Directive({
    selector: 'mat-backlayer-content, [mat-backlayer-content], [matBacklayerContent]',
    host: {
        'class': 'mat-backlayer-content',
        '[attr.role]': '"menu"',
        '[attr.aria-label]': '"context"'
    }
})
export class MatBacklayerContent {
}

@Directive({})
export abstract class _MatBacklayerButton implements AfterViewInit, OnDestroy, FocusableOption {

    constructor(
        private _elementRef: ElementRef,
        private _focusMonitor: FocusMonitor,
    ) { }

    ngAfterViewInit() {
        this._focusMonitor.monitor(this._elementRef, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef);
    }

    focus(origin?: FocusOrigin, options?: FocusOptions): void {
        if (origin) {
            this._focusMonitor.focusVia(this._getHostElement(), origin, options);
        } else {
            this._getHostElement().focus(options);
        }
    }

    _getHostElement() {
        return this._elementRef.nativeElement;
    }
}

@Component({
    selector: 'button[mat-backlayer-toggle], button[matBacklayerToggle]',
    animations: [BackdropAnimations.backdropButton],
    template: `
        <ng-container *ngIf="!_opened(); else close">
            <div class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
                <ng-content></ng-content>
            </div>
            <span class="mat-backdrop-button-focus-overlay"></span>
        </ng-container>
        <ng-template #close>
            <div aria-hidden="true" class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
            </div>
            <span class="mat-backdrop-button-focus-overlay"></span>
        </ng-template>
    `,
    host: {
        'class': 'mat-backdrop-button',
        '(click)': '_onClick()',
        '[attr.aria-label]': '_arialabel'
    }
})
export class MatBacklayerToggle extends _MatBacklayerButton implements OnInit {

    _arialabel = 'Reveal context menu';

    @Input() offset: string | 'full' = '200px';
    @Input() autoFocus!: string | boolean;
    @Input() restoreFocus?: string | boolean;

    @Output() open: EventEmitter<void> = new EventEmitter<void>();
    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    _state: 'void' | 'opened' = 'void';

    private _frontLayerRef: FrontLayerRef<any> | undefined;

    constructor(
        private _backdrop: Backdrop,
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
    ) {
        super(elementRef, focusMonitor);
    }

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
            this._arialabel = 'Conceal context menu';
            this.open.emit();
        });

        this._frontLayerRef?.beforeLift().subscribe(() => {
            this._state = 'void';
        });

        this._frontLayerRef?.afterLift().subscribe(() => {
            this._arialabel = 'Reveal context menu';
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
            this._frontLayerRef?.drop(this.offset, this.autoFocus, this.restoreFocus);
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
            <span class="mat-backdrop-button-focus-overlay"></span>
        </ng-container>
        <ng-template #close>
            <div aria-hidden="true" class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
            </div>
            <span class="mat-backdrop-button-focus-overlay"></span>
        </ng-template>
    `,
    host: {
        'class': 'mat-backdrop-button',
        "(keydown.enter)": "$event.preventDefault() ; $event.target.click() ;",
        "(keydown.space)": "$event.preventDefault() ; $event.target.click() ;",
        '(click)': '_onClick()',
    }
})
export class MatBacklayerClose extends _MatBacklayerButton implements OnInit, OnDestroy {

    @Output() close: EventEmitter<void> = new EventEmitter<void>();
    @Output() default: EventEmitter<void> = new EventEmitter<void>();

    _state: 'void' | 'opened' = 'void';

    private _frontLayerRef: FrontLayerRef<any> | undefined;
    private _originAriaLabel!: string;
    private _beforeDropedSubscription!: Subscription | undefined;
    private _beforeLiftSubscription!: Subscription | undefined;
    private _afterLiftSubscription!: Subscription | undefined;

    constructor(
        protected _backdrop: Backdrop,
        protected elementRef: ElementRef,
        protected focusMonitor: FocusMonitor,
    ) {
        super(elementRef, focusMonitor);
    }

    ngOnInit(): void {
        // Set tabindex so anchor link is accessable with tab
        let _originTabIndex = this.elementRef.nativeElement.getAttribute('tabindex');
        if (_originTabIndex == null || _originTabIndex === '') {
            this._originAriaLabel = this.elementRef.nativeElement.setAttribute('tabindex', '0');
        }

        race(this._backdrop.afterOpened(), this._backdrop.afterContentChanged())
            .pipe(take(1))
            .subscribe(() => {
                this._init();
            });
    }

    protected _init() {
        this._frontLayerRef = this._backdrop.getOpenedFrontLayer();

        this._beforeDropedSubscription = this._frontLayerRef?.beforeDroped().subscribe(() => {
            this._state = 'opened';
            this._originAriaLabel = this.elementRef.nativeElement.getAttribute('aria-label');
            this.elementRef.nativeElement.setAttribute('aria-label', 'Conceal Context Menu');
        });

        this._beforeLiftSubscription = this._frontLayerRef?.beforeLift().subscribe(() => {
            this._state = 'void';
            this.elementRef.nativeElement.setAttribute('aria-label', this._originAriaLabel ? this._originAriaLabel : '');
        });

        this._afterLiftSubscription = this._frontLayerRef?.afterLift().subscribe(() => {
            this.close.emit();
        });
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
        this._beforeDropedSubscription?.unsubscribe();
        this._beforeLiftSubscription?.unsubscribe();
        this._afterLiftSubscription?.unsubscribe();
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

@Component({
    selector: 'a[mat-backlayer-close], a[matBacklayerClose]',
    animations: [BackdropAnimations.backdropButton],
    template: `
        <ng-container *ngIf="!_opened(); else close">
            <div class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
                <ng-content></ng-content>
            </div>
            <span class="mat-backdrop-button-focus-overlay"></span>
        </ng-container>
        <ng-template #close>
            <div aria-hidden="true" class="mat-backdrop-button-wrapper" [@rotate]="_state === 'opened' ? 'opened' : 'closed'">
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
            </div>
            <span class="mat-backdrop-button-focus-overlay"></span>
        </ng-template>
    `,
    host: {
        '[attr.role]': '_role'
    }
})
export class MatBacklayerCloseAnchor extends MatBacklayerClose implements OnInit {

    _role: string = 'link';

    override _init(): void {
        super._init();

        let _frontLayerRef = this._backdrop.getOpenedFrontLayer();
        _frontLayerRef?.beforeDroped().subscribe(() => this._role = 'button');
        _frontLayerRef?.beforeLift().subscribe(() => this._role = 'link');
    }
}

@Component({
    selector: `button[mat-backlayer-move], button[matBacklayerMove]`,
    template: `
        <span class="mat-backdrop-button-wrapper"><ng-content></ng-content></span>
        <span class="mat-backdrop-button-focus-overlay"></span>
    `,
    host: {
        'class': 'mat-backdrop-button',
        '(click)': '_onClick()'
    }
})
export class MatBacklayerMove extends _MatBacklayerButton implements OnInit {

    @Input() offset: string | 'full' = '200px';
    @Input() autoFocus!: string | boolean;
    @Input() restoreFocus!: string | boolean;

    @Output() move: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private _backdrop: Backdrop,
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
    ) {
        super(elementRef, focusMonitor);
    }

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
                _frontLayerRef.drop(this.offset, this.autoFocus, this.restoreFocus);
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
