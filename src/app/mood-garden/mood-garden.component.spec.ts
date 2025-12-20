import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoodGardenComponent } from './mood-garden.component';

describe('MoodGardenComponent', () => {
  let component: MoodGardenComponent;
  let fixture: ComponentFixture<MoodGardenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoodGardenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoodGardenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
