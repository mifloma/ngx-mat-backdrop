import { Directive } from "@angular/core";

/**
 * Scrollable content container of a front-layer.
 */
@Directive({
    selector: `[mat-frontlayer-content], mat-frontlayer-content, [matFrontLayerContent]`,
    host: { 'class': 'mat-frontlayer-content' }
})
export class MatFrontlayerContent { }

/**
 * Title of a front-layer element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
    selector: `[mat-frontlayer-title], [matFrontLayerTitle]`,
    host: { 'class': 'mat-frontlayer-title' }
})
export class MatFrontlayerTitle { }

