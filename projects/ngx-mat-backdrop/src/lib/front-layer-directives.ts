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
    selector: `button[mat-frontlayer-move], button[matFrontlayerMove]`,
    host: {
        'class': 'mat-frontlayer-move',
        '(click)': '_onClick()'
    }
})
export class MatFrontLayerButton implements OnInit {

    @Input() size: string = '200px';
    @Input() maxSize: boolean = false;

    @Output() move: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private _backdrop: Backdrop
    ) { }

    ngOnInit(): void {
        if (this.maxSize) {
            this.size = 'calc(100vh - 56px)';
        }
    }

    _onClick(): void {
        let _frontLayerRef = this._backdrop.getOpenedFrontLayer();
        if (_frontLayerRef) {
            if (_frontLayerRef.getState() === FrontLayerState.DROPED) {
                _frontLayerRef.updateDropPosition(this.size);
            } else {
                _frontLayerRef.drop(this.size);
            }
            this.move.emit();
        }
    }
}

