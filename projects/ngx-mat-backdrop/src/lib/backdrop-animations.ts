import { animate, animateChild, AnimationTriggerMetadata, group, query, state, style, transition, trigger } from "@angular/animations";

export class AnimationCurves {
    static STANDARD_CURVE = 'cubic-bezier(0.4,0.0,0.2,1)';
    static DECELERATION_CURVE = 'cubic-bezier(0.0,0.0,0.2,1)';
    static ACCELERATION_CURVE = 'cubic-bezier(0.4,0.0,1,1)';
    static SHARP_CURVE = 'cubic-bezier(0.4,0.0,0.6,1)';
}

/** @docs-private */
export class AnimationDurations {
    static COMPLEX = '375ms';
    static ENTERING = '225ms';
    static EXITING = '195ms';
}

export const BackdropAnimations: {
    readonly frontLayerContainer: AnimationTriggerMetadata;
    readonly backdropButton: AnimationTriggerMetadata;
} = {
    frontLayerContainer: trigger('frontLayerContainer', [
        state('void, exit', style({ transform: 'translateY(100%)' })),
        state('enter', style({ transform: 'none' })),
        state('droped', style({ transform: 'translateY(50%)' })),
        transition('* => enter', animate(`${AnimationDurations.EXITING} ${AnimationCurves.DECELERATION_CURVE}`,
            style({ transform: 'none' }))),
        transition('* => void, * => exit',
            animate(`${AnimationDurations.COMPLEX} ${AnimationCurves.ACCELERATION_CURVE}`)),

        // transition('* => droped', [
        //     query('.container', [
        //         animate('250ms ease-in-out')
        //     ])
        // ])

        transition('* => droped',
            group([
                animate(`${AnimationDurations.COMPLEX} ${AnimationCurves.ACCELERATION_CURVE}`),
                query('@*', animateChild(), { optional: true })
            ])
        )
    ]),
    backdropButton: trigger('rotate', [
        state('closed', style({ transform: 'none' })),
        state('opened', style({ transform: 'rotate(0.75turn)' })),
        transition('closed => opened', animate(`${AnimationDurations.ENTERING} ${AnimationCurves.STANDARD_CURVE}`)),
        transition('opened => closed', animate(`${AnimationDurations.EXITING} ${AnimationCurves.STANDARD_CURVE}`))
    ])
}