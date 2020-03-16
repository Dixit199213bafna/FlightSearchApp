import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject } from 'rxjs';
import * as _ from "lodash";

const formatDate = (date) => {
  let d = new Date(date),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('/');
}

@Injectable({
  providedIn: 'root'
})

export class FlightSearchService {

  private flightSource = new BehaviorSubject(null);
  currentFlights = this.flightSource.asObservable();

  constructor(private http: HttpClient) { }

  fetchFlightDetailsBasedOnSearchCriteria(searchCriteria) {
    const flightDetails = {
      oneWayFlights: [],
      returnFlights: [],
      searchCriteria: searchCriteria,
    };
    this.http.get('https://tw-frontenders.firebaseio.com/advFlightSearch.json').subscribe(response => {
      flightDetails.oneWayFlights = _.filter(response, (flight) => {
          return flight.origin === searchCriteria.source && flight.destination === searchCriteria.destination && flight.date === formatDate(searchCriteria.departureDate);
      });
      if(searchCriteria.typeOfTrip === 'return') {
        flightDetails.returnFlights = _.filter(response, (flight) => {
          return flight.origin === searchCriteria.destination && flight.destination === searchCriteria.source && flight.date === formatDate(searchCriteria.returnDate);
        });
      }
      this.flightSource.next(flightDetails)
    });
  }
}
