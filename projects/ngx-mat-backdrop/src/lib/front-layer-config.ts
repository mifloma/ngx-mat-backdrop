import { ComponentFactoryResolver, ViewContainerRef } from "@angular/core";

/** Valid ARIA roles for a dialog element. */
export type DialogRole = 'main' | 'dialog' | 'alertdialog';

export class FrontLayerConfig<D = any> {

    /**
    * Where the attached component should live in Angular's *logical* component tree.
    * This affects what is available for injection and the change detection order for the
    * component instantiated inside of the dialog. This does not affect where the dialog
    * content will be rendered.
    */
    viewContainerRef?: ViewContainerRef;

    /** ID for the front-layer. If omitted, a unique one will be generated. */
    id?: string;

    /** The ARIA role of the frontlayer element. */
    role?: DialogRole = 'main';

    /** Aria label to assign to the frontlayer element. */
    ariaLabel?: string | null = null;

    /** Alternate `ComponentFactoryResolver` to use when resolving the associated component. */
    componentFactoryResolver?: ComponentFactoryResolver;

    /** Data being injected into the child component. */
    data?: D | null = null;

    /** Override for the dialog's top position. */
    top?: string = '56px';

    /** Show the front-layer with elevation throwing a shadow on the underlying surface. */
    popover?: boolean = false;

    /** Show the front-layer with transparent background. **/
    transparent?: boolean = false;

    /** When the backlayer is revealed, the frontlayer content becomes inactive. */
    disableOnDrop?: boolean = true;

    autoFocus?: string | boolean = true;

    restoreFocus?: string | boolean = true;

    /** Merges the specified config with the default config */
    static merge(config: FrontLayerConfig): FrontLayerConfig {
        let _config = new FrontLayerConfig();
        return { ..._config, ...config };
    }
}
