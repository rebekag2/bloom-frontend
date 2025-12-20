import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusGardenComponent } from './focus-garden.component';

describe('FocusGardenComponent', () => {
  let component: FocusGardenComponent;
  let fixture: ComponentFixture<FocusGardenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FocusGardenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FocusGardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
