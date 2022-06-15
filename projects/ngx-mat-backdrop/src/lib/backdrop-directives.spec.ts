import { Component } from "@angular/core";
import { render, screen, waitForElementToBeRemoved } from "@testing-library/angular";
import userEvent from '@testing-library/user-event';
import { Backdrop } from "./backdrop";
import { MatBackdropModule } from "./ngx-mat-backdrop.module";

@Component({
    selector: 'test-component',
    template: `
        <mat-backdrop [matBackdropTriggerFor]="frontlayer">
            <mat-backlayer>
                <mat-backlayer-title>
                    <a mat-backlayer-close aria-label="user-control">btn</a>
                </mat-backlayer-title>
                <mat-backlayer-content>context</mat-backlayer-content>
            </mat-backlayer>
            <mat-frontlayer #frontlayer>
                <h2 mat-frontlayer-title>title</h2>
            </mat-frontlayer>
        </mat-backdrop>
    `
})
class TestComponent {
    constructor(public _backdrop: Backdrop) { }
}

describe('Backlayer Close Button', () => {

    beforeEach(() => jest.useFakeTimers());

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    const renderComponent = () => render(TestComponent, {
        imports: [MatBackdropModule],
        componentProviders: [
            { provide: Backdrop }
        ]
    });

    it('should show users custom control', async () => {
        // arrange
        await renderComponent();
        // assert
        const userControl = await screen.findByRole('link', { hidden: true }); // FIXME: Should also filter by aria-label 'user-control'
        expect(userControl).toBeInTheDocument();
    });

    it('should show conceal button after backlayer content has been revealed', async () => {
        // arrange
        const { fixture } = await renderComponent();
        // act
        const frontlayerRef = fixture.componentInstance._backdrop.getOpenedFrontLayer();
        frontlayerRef?.drop('200px');
        // assert
        await waitForElementToBeRemoved(() => screen.queryByRole('link', { hidden: true }));
        expect(await screen.findByRole('button', { hidden: true })).toBeInTheDocument(); // FIXME: Should also filter by aria-label 'Conceal Context Menu'
    });

    it('should conceal backlayer content after conceal button clicked', async () => {
        // arrange
        const { fixture } = await renderComponent();
        jest.runAllTimers();
        const frontlayerRef = fixture.componentInstance._backdrop.getOpenedFrontLayer();
        frontlayerRef?.drop('200px');
        // act
        const concealButton = await screen.findByRole('button', { hidden: true });
        userEvent.setup({ delay: null }).click(concealButton);
        // assert
        await waitForElementToBeRemoved(() => screen.queryByRole('menu', { hidden: true }));
    });

    it('should show users custom control again after conceale button clicked', async () => {
        // arrange
        const { fixture } = await renderComponent();
        jest.runAllTimers();
        const frontlayerRef = fixture.componentInstance._backdrop.getOpenedFrontLayer();
        frontlayerRef?.drop('200px');
        // act
        const concealButton = await screen.findByRole('button', { hidden: true });
        userEvent.setup({ delay: null }).click(concealButton);
        // assert
        await waitForElementToBeRemoved(() => screen.queryByRole('button', { hidden: true }));
        expect(await screen.findByRole('link', { hidden: true })).toBeInTheDocument(); // FIXME: Should also filter by aria-label 'user-control'
    });

});