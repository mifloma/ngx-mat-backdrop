import { AfterContentInit, AfterViewInit, Component, Directive, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { pipe, take } from "rxjs";
import { Backdrop } from "./backdrop";

/**
 * Scrollable content container of a front-layer.
 */
@Component({
    selector: `[mat-frontlayer-content], mat-frontlayer-content, [matFrontLayerContent]`,
    template: `
        <div class="mat-frontlayer-content-divider" *ngIf="_scrolling"></div>
        <ng-content></ng-content>
    `,
    host: {
        'class': 'mat-frontlayer-content',
        '(scroll)': '_onScroll($event)'
    }
})
export class MatFrontlayerContent {

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

@Component({
    selector: 'button[mat-frontlayer-drop], button[matFrontlayerDrop]',
    template: `
        <ng-container *ngIf="_show">
            <ng-content></ng-content>
        </ng-container>
    `,
    host: {
        'class': 'mat-frontlayer-drop',
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
