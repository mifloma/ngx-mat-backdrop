import { Directive } from "@angular/core";

/**
 * Scrollable content container of a front-layer.
 */
@Directive({
    selector: `[front-layer-content], front-layer-content, [frontLayerContent]`,
    host: { 'class': 'front-layer-content' }
})
export class FrontLayerContent { }

/**
 * Title of a front-layer element. Stays fixed to the top of the dialog when scrolling.
 */
@Directive({
    selector: `[front-layer-title], front-layer-title, [frontLayerTitle]`,
    host: { 'class': 'front-layer-title' }
})
export class FrontLayerTitle { }

