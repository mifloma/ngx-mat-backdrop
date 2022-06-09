import { render, screen } from '@testing-library/angular'

describe('Backdrop', () => {

  it('should run', async () => {
    // arrange
    await render('<h2 data-testid="test">test</h2>');
    // assert
    const heading = await screen.findByTestId('test');
    expect(heading).not.toBeNull();
  });

});
