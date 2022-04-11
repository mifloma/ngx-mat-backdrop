import { Component, Directive, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Backdrop } from "./backdrop";
import { FrontLayerState } from "./front-layer-ref";

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
    host: { 'class': 'mat-frontlayer-title' }
})
export class MatFrontlayerTitle { }

@Directive({
    selector: 'button[mat-frontlayer-close], button[matfrontlayerClose]',
    host: {
        'class': 'mat-frontlayer-close',
        '(click)': '_onClick()'
    }
})
export class MatFrontLayerClose {

    @Output() close: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private _backdrop: Backdrop
    ) { }

    _onClick(): void {
        let _frontLayerRef = this._backdrop.getOpenedFrontLayer();
        if (_frontLayerRef) {
            _frontLayerRef.close();
            this.close.emit();
        }
    }
}

