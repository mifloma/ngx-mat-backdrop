import { animate, AnimationTriggerMetadata, state, style, transition, trigger } from "@angular/animations";

export const BackdropAnimations: {
    readonly frontLayerContainer: AnimationTriggerMetadata;
    readonly backdropButton: AnimationTriggerMetadata;
} = {
    frontLayerContainer: trigger('frontLayerContainer', [
        state('void, exit', style({ transform: 'translateY(100%)' })),
        state('enter', style({ transform: 'none' })),
        state('droped', style({ transform: 'translateY(50%)' })),
        transition('* => enter', animate('500ms ease-in-out',
            style({ transform: 'none' }))),
        transition('* => void, * => exit',
            animate('500ms ease-in-out'))

        // transition('* => droped', [
        //     query('.container', [
        //         animate('250ms ease-in-out')
        //     ])
        // ])
    ]),
    backdropButton: trigger('rotate', [
        state('closed', style({ transform: 'none' })),
        state('opened', style({ transform: 'rotate(0.75turn)' })),
        transition('closed <=> opened', animate('250ms'))
    ])
}