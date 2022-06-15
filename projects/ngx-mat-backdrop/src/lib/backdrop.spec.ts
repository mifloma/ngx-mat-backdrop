import { render, screen, within } from '@testing-library/angular'
import userEvent from '@testing-library/user-event';
import { Backdrop } from './backdrop';
import { MatBackdropModule } from './ngx-mat-backdrop.module';

const plainBackdropTemplate = `
    <mat-backdrop [matBackdropTriggerFor]="frontlayer">
      <mat-backlayer>
        <mat-backlayer-title>nav</mat-backlayer-title>
      </mat-backlayer>
      <mat-frontlayer #frontlayer>
        <h2 mat-frontlayer-title>title</h2>
        <mat-frontlayer-content>content</mat-frontlayer-content>
      </mat-frontlayer>
    </mat-backdrop> 
`;

const backdropWithContextMenuTemplate = `
    <mat-backdrop [matBackdropTriggerFor]="frontlayer">
      <mat-backlayer>
        <mat-backlayer-title>nav</mat-backlayer-title>
        <mat-backlayer-content>context</mat-backlayer-content>
      </mat-backlayer>
      <mat-frontlayer #frontlayer>
        <div mat-frontlayer-title>
          <h2>title</h2>
          <button mat-frontlayer-drop>drop</button>
        </div>
        <mat-frontlayer-content>content</mat-frontlayer-content>
      </mat-frontlayer>
    </mat-backdrop> 
`;

describe('Backdrop', () => {

  const renderComponent = (template: string) => render(template, {
    imports: [MatBackdropModule],
    componentProviders: [
      { provide: Backdrop }
    ]
  });

  it('should show navigation on the backlayer', async () => {
    // arrange
    await renderComponent(plainBackdropTemplate);
    // assert
    const navigation = await screen.findByRole('navigation', { hidden: true });
    expect(navigation).toBeInTheDocument();
    expect(navigation).toHaveTextContent('nav');
  });

  it('should show main area on the frontlayer', async () => {
    // arrange
    await renderComponent(plainBackdropTemplate);
    // assert
    const main = await screen.findByRole('main', { hidden: true });
    expect(main).toBeInTheDocument();
  })

  it('should show main title on the frontlayer', async () => {
    // arrange
    await renderComponent(plainBackdropTemplate);
    // assert
    const main = await screen.findByRole('main', { hidden: true });
    const title = await within(main).findByRole('heading', { hidden: true, level: 2 });
    expect(title).toHaveTextContent('title');
  })

  it('should show content on the frontlayer', async () => {
    // arrange
    await renderComponent(plainBackdropTemplate);
    // assert
    const main = await screen.findByRole('main', { hidden: true });
    const content = await within(main).findByRole('region', { hidden: true }); // { name: /content/i } would be better but throws error
    expect(content).toHaveTextContent('content');
  })

  it('should reveale context menu on the backlayer', async () => {
    // arrange
    await renderComponent(backdropWithContextMenuTemplate);
    // act
    const main = await screen.findByRole('main', { hidden: true });
    const dropBtn = await within(main).findByRole('button', { hidden: true });
    userEvent.click(dropBtn);
    // assert
    const ctxMenu = await screen.findByRole('menu', { hidden: true });
    expect(ctxMenu).toHaveTextContent('context');
  })

});
