import { ComponentFactoryResolver, ViewContainerRef } from "@angular/core";

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

    /** Alternate `ComponentFactoryResolver` to use when resolving the associated component. */
    componentFactoryResolver?: ComponentFactoryResolver;

    /** Data being injected into the child component. */
    data?: D | null = null;

    /** Override for the dialog's top position. */
    top?: string = '56px';

    /** Show the front-layer with elevation throwing a shadow on the underlying surface. */
    elevation?: boolean = false;

    /** Show the front-layer with transparent background. **/
    transparent?: boolean = false;

    /** When the back layer is revealed, the front layer content becomes inactive. */
    disableOnDrop?: boolean = true;

    /** Merges the specified config with the default config */
    static merge(config: FrontLayerConfig): FrontLayerConfig {
        let _config = new FrontLayerConfig();
        return { ..._config, ...config };
    }
}
