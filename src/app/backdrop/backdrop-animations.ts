import { animate, AnimationTriggerMetadata, query, state, style, transition, trigger } from "@angular/animations";

export const BackdropAnimations: {
    readonly frontLayerContainer: AnimationTriggerMetadata;
} = {
    frontLayerContainer: trigger('frontLayerContainer', [
        state('void, exit', style({ transform: 'translateY(100%)' })),
        state('enter', style({ transform: 'none' })),
        state('droped', style({ transform: 'translateY(50%)' })),
        transition('* => enter', animate('500ms ease-in-out',
            style({ transform: 'none' }))),
        transition('* => void, * => exit',
            animate('500ms ease-in-out')),

        // transition('* => droped', [
        //     query('.container', [
        //         animate('250ms ease-in-out')
        //     ])
        // ])
    ])
}