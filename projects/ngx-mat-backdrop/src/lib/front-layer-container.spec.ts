import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontLayerContainer } from './front-layer-container';

describe('FrontLayerContainerComponent', () => {
  let component: FrontLayerContainer;
  let fixture: ComponentFixture<FrontLayerContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrontLayerContainer]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FrontLayerContainer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
