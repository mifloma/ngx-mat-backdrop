import { Overlay } from "@angular/cdk/overlay";
import { render, screen } from "@testing-library/angular";
import { within } from "@testing-library/dom";
import { MatBackdropModule } from "../../../../ngx-mat-backdrop/src/lib/ngx-mat-backdrop.module";
import { Backdrop } from "../../../../ngx-mat-backdrop/src/lib/backdrop";
import { DocumentListComponent } from "./document-list.component";

describe('Document List', () => {

    const renderComponent = () => render(DocumentListComponent, {
        imports: [MatBackdropModule],
        componentProviders: [
            { provide: Backdrop },
            { provide: Overlay }
        ]
    });

    it('should work', async () => {
        // arrange
        await renderComponent();
        // assert
        const content = await screen.findByRole('region', { name: /content/i });
        const documentList = await within(content).findByRole('list');
        expect(documentList).toBeInTheDocument();
    });
})