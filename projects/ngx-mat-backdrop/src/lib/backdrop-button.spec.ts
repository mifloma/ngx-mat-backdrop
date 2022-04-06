import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatBackdropButton } from './backdrop-button';

describe('MatBackdropButtonComponent', () => {
  let component: MatBackdropButton;
  let fixture: ComponentFixture<MatBackdropButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MatBackdropButton]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MatBackdropButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
