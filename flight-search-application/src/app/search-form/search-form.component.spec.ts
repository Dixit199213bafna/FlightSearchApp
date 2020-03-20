import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFormComponent } from './search-form.component';
import {FlightSearchService} from "../services/flight-search.service";
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {MatAutocompleteModule} from "@angular/material/autocomplete";

describe('SearchFormComponent', () => {
  let component: SearchFormComponent;
  let fixture: ComponentFixture<SearchFormComponent>;
  let flightSearchService: FlightSearchService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFormComponent ],
      imports: [ HttpClientTestingModule, MatAutocompleteModule ],
      providers: [FlightSearchService]
    })
    .compileComponents();
    flightSearchService = TestBed.get(FlightSearchService);
  }));

  const setFormValue = (control, value) => {
    component.searchForm.controls[control].setValue(value)
  }
  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it(' form should be invalid if none of th field are entered and directly click on submit', async () => {
    component.searchFlight();
    expect(component.searchForm.valid).toBeFalse();
  });

  it('form should be valid if we fill the correct data for one way trip', async () => {
    setFormValue('source', 'Pune (PNQ)');
    setFormValue('destination', 'Mumbai (BOM)');
    setFormValue('departureDate', '11/1/2020');
    expect(component.searchForm.valid).toBeTrue();
  });

  it('form should be valid if we fill the correct data for return trip', async () => {
    setFormValue('typeOfTrip', 'return');
    setFormValue('source', 'Pune (PNQ)');
    setFormValue('destination', 'Mumbai (BOM)');
    setFormValue('departureDate', '11/1/2020');
    setFormValue('returnDate', '11/2/2020');
    expect(component.searchForm.valid).toBeTrue();
  });

  it('form should be invalid if we fill the source and destination as same', async () => {
    setFormValue('source', 'Pune (PNQ)');
    setFormValue('destination', 'Pune (PNQ)');
    setFormValue('departureDate', '11/1/2020');
    setFormValue('returnDate', '11/2/2020');
    expect(component.searchForm.valid).toBeFalse();
  });

  it('should call fetchFlightDetailsBasedOnSearchCriteria function when form is valid and is submitted', async () => {
    spyOn(flightSearchService, 'fetchFlightDetailsBasedOnSearchCriteria');
    setFormValue('source', 'Pune (PNQ)');
    setFormValue('destination', 'Mumbai (BOM)');
    setFormValue('departureDate', '11/1/2020');
    component.searchFlight();
    expect(flightSearchService.fetchFlightDetailsBasedOnSearchCriteria).toHaveBeenCalledWith(component.searchForm.value);
  });

  it('should filter flight results based on the slider value', async () => {
    spyOn(flightSearchService, 'filterBasedOnMinMaxValue');
    const event = {
      value: 200,
      highValue: 5000
    };
    component.filterBasedOnMinMaxValue(event);
    expect(flightSearchService.filterBasedOnMinMaxValue).toHaveBeenCalledWith(event.value, event.highValue);
  });

});
