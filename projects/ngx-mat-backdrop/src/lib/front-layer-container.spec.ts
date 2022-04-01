import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatFrontLayerContainer } from './front-layer-container';

describe('FrontLayerContainerComponent', () => {
  let component: MatFrontLayerContainer;
  let fixture: ComponentFixture<MatFrontLayerContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatFrontLayerContainer]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatFrontLayerContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
