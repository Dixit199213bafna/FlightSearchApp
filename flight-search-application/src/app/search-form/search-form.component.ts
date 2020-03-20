import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators, ValidatorFn} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { FlightSearchService } from '../services/flight-search.service';
import { Options } from 'ng5-slider';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit {
  minDate: Date;
  minValue: number = 0;
  maxValue: number = 10000;
  options: Options = {
    floor: 0,
    ceil: 10000
  };
  searchForm = new FormGroup({
    source : new FormControl('', [Validators.required]),
    destination : new FormControl('', [Validators.required, this.differentFromSource.bind(this)]),
    typeOfTrip: new FormControl('oneWay'),
    noOfPassengers: new FormControl(1, [Validators.required]),
    departureDate: new FormControl('', [Validators.required]),
    returnDate: new FormControl({value: null, disabled: true}, [Validators  .required]),
  });
  cities: string[] = ['Pune (PNQ)', 'Mumbai (BOM)', 'Bengaluru (BLR)', 'Delhi (DEL)'];
  sourceOptions: Observable<string[]>;
  destinationOptions: Observable<string[]>;

  constructor(private flightSearchService: FlightSearchService) {
    this.minDate = new Date();
  }

  differentFromSource(control: FormControl): {[s: string]: boolean} {
    if(this.searchForm && control.value === this.searchForm.get('source').value) {
      return { valid: false}
    }
    return null;
  }

  ngOnInit() {
    this.sourceOptions = this.searchForm.get('source').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );
    this.destinationOptions = this.searchForm.get('destination').valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );

    this.searchForm.get('typeOfTrip').valueChanges
      .subscribe(value => {
        if(value === 'return') {
          this.searchForm.get('returnDate').setValidators([Validators.required]);
          this.searchForm.get('returnDate').enable();
        } else {
          this.searchForm.get('returnDate').clearValidators();
          this.searchForm.get('returnDate').disable();
        }
      });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(option => option.toLowerCase().includes(filterValue));
  }

  searchFlight() {
    if(this.searchForm.valid){
      this.flightSearchService.fetchFlightDetailsBasedOnSearchCriteria(this.searchForm.value);
    }
  }

  filterBasedOnMinMaxValue(event) {
    this.flightSearchService.filterBasedOnMinMaxValue(event.value, event.highValue);
  }
}
