import { Component, ContentChildren, Directive, EventEmitter, Input, OnInit, Output, QueryList } from "@angular/core";
import { take } from "rxjs";
import { Backdrop } from "./backdrop";
import { MatFrontlayer } from "./backdrop-directives";

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
        '(scroll)': '_onScroll($event)'
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
            <ng-content></ng-content>
        </ng-container>
    `,
    host: {
        'class': 'mat-frontlayer-button',
        '(click)': '_onClick()'
    }
})
export class MatFrontlayerDrop implements OnInit {

    @Input() offset: string | 'full' = '200px';

    @Output() drop: EventEmitter<void> = new EventEmitter<void>();

    _show: boolean = true;

    constructor(
        private _backdrop: Backdrop
    ) { }

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
            _frontLayerRef.drop(this.offset);
            this.drop.emit();
        }
    }
}

@Directive({
    selector: 'button[mat-frontlayer-close], button[matFrontlayerClose]',
    exportAs: 'matFrontlayerClose',
    host: {
        'class': 'mat-frontlayer-button',
        '(click)': '_onClick()'
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
