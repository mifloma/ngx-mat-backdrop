import { ComponentFactoryResolver, ViewContainerRef } from "@angular/core";

export class FrontLayerConfig<D = any> {

    /**
    * Where the attached component should live in Angular's *logical* component tree.
    * This affects what is available for injection and the change detection order for the
    * component instantiated inside of the dialog. This does not affect where the dialog
    * content will be rendered.
    */
    viewContainerRef?: ViewContainerRef;

    /** Alternate `ComponentFactoryResolver` to use when resolving the associated component. */
    componentFactoryResolver?: ComponentFactoryResolver;

    /** Data being injected into the child component. */
    data?: D | null = null;

    /** Override for the dialog's top position. */
    top?: string = '56px';
}
