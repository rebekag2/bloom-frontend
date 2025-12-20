import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusSessionComponent } from './focus-session.component';

describe('FocusSessionComponent', () => {
  let component: FocusSessionComponent;
  let fixture: ComponentFixture<FocusSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FocusSessionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FocusSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
