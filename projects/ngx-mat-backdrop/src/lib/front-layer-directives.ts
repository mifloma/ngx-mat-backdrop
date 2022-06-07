import { FocusMonitor } from "@angular/cdk/a11y";
import { Component, ContentChildren, Directive, ElementRef, EventEmitter, Input, OnInit, Output, QueryList } from "@angular/core";
import { take } from "rxjs";
import { Backdrop } from "./backdrop";
import { MatFrontlayer, _MatBacklayerButton } from "./backdrop-directives";

/**
 * Scrollable content container of a front-layer.
 */
@Component({
    selector: `[mat-frontlayer-content], mat-frontlayer-content, [matFrontLayerContent]`,
    template: `
        <div class="mat-frontlayer-content-divider" *ngIf="showDividerOnScroll && _scrolling"></div>
        <ng-content></ng-content>
    `,
    host: {
        'class': 'mat-frontlayer-content',
        '(scroll)': '_onScroll($event)',
        '[attr.role]': '"region"',
        '[attr.aria-label]': '"content"'
    }
})
export class MatFrontlayerContent {

    @Input() showDividerOnScroll: boolean = true;

    _scrolling: boolean = false;

    _onScroll(event: any) {
        this._scrolling = event.srcElement.scrollTop > 0;
    }
}

/**
 * Title of a front-layer element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
    selector: `[mat-frontlayer-title], [matFrontLayerTitle]`,
    host: {
        'class': 'mat-frontlayer-title'
    }
})
export class MatFrontlayerTitle { }

@Directive({
    selector: `[mat-frontlayer-actions], mat-frontlayer-actions, [matFrontlayerActions]`,
    host: {
        'class': 'mat-frontlayer-actions',
        '[class.mat-frontlayer-actions-align-center]': 'align === "center"',
        '[class.mat-frontlayer-actions-align-end]': 'align === "end"',
        '[attr.role]': '"footer"',
        '[attr.aria-label]': '"content actions"'
    }
})
export class MatFrontlayerActions {

    /**
    * Horizontal alignment of action buttons.
    */
    @Input() align?: 'start' | 'center' | 'end' = 'start';
}

@Component({
    selector: 'button[mat-frontlayer-drop], button[matFrontlayerDrop]',
    template: `
        <ng-container *ngIf="_show">
            <span class="mat-backdrop-button-wrapper"><ng-content></ng-content></span>
            <span class="mat-frontlayer-button-focus-overlay"></span>
        </ng-container>
    `,
    host: {
        'class': 'mat-frontlayer-button',
        '(click)': '_onClick()'
    }
})
export class MatFrontlayerDrop extends _MatBacklayerButton implements OnInit {

    @Input() offset: string | 'full' = '200px';
    @Input() autoFocus!: string | boolean;
    @Input() restoreFocus!: string | boolean;

    @Output() drop: EventEmitter<void> = new EventEmitter<void>();

    _show: boolean = true;

    constructor(
        private _backdrop: Backdrop,
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
    ) {
        super(elementRef, focusMonitor);
    }

    ngOnInit(): void {
        this._backdrop.afterOpened().pipe(take(1)).subscribe(() => {
            this._init();
        });
        this._backdrop.afterContentChanged().pipe(take(1)).subscribe(() => {
            this._init();
        });
    }

    private _init(): void {
        let _frontlayer = this._backdrop.getOpenedFrontLayer();
        if (_frontlayer) {
            _frontlayer.beforeDroped().subscribe(() => this._show = false);
            _frontlayer.afterLift().subscribe(() => this._show = true);
        }
    }

    _onClick(): void {
        let _frontLayerRef = this._backdrop.getOpenedFrontLayer();
        if (_frontLayerRef) {
            _frontLayerRef.drop(this.offset, this.autoFocus, this.restoreFocus);
            this.drop.emit();
        }
    }
}

@Directive({
    selector: 'button[mat-frontlayer-close], button[matFrontlayerClose]',
    exportAs: 'matFrontlayerClose',
    host: {
        'class': 'mat-frontlayer-button',
        '(click)': '_onClick()',
        '[attr.aria-label]': '"Conceal context menu"'
    }
})
export class MatFrontLayerClose {

    constructor(
        private _backdrop: Backdrop
    ) { }

    _onClick(): void {
        let _frontLayerRef = this._backdrop.getOpenedFrontLayer();
        if (_frontLayerRef) {
            _frontLayerRef.close();
        }
    }
}

@Component({
    selector: 'mat-frontlayer-group',
    template: `<ng-content></ng-content>`
})
export class MatFrontlayerGroup {
    @ContentChildren(MatFrontlayer, { descendants: true }) _allTabs!: QueryList<MatFrontlayer>;
    @Input() active: number = 0;
}
