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
};

@Injectable({
  providedIn: 'root'
})

export class FlightSearchService {

  private flightSource = new BehaviorSubject(null);
  currentFlights = this.flightSource.asObservable();
  private flightDetailsBackUp;
  flightDetails = {
    oneWayFlights: [],
    returnFlights: [],
    searchCriteria: null
  };

  constructor(private http: HttpClient) { }

  dateDiff(t1, t2, d1 = '2017-05-02', d2 = '2017-05-02') {

    const timeStart: any = new Date(Date.parse(d1.replace(/[/]/g, '-') + "T" + ('0' + parseInt(t1.split(':')[0])).slice(-2) + ':' +t1.split(':')[1]));
    const timeEnd: any = new Date(Date.parse(d2.replace(/[/]/g, '-') + "T" + ('0' + parseInt(t2.split(':')[0])).slice(-2) + ':' +t2.split(':')[1]));

    const d3 = new Date(timeEnd - timeStart);
    const d0 = new Date(0);

    return {
      getHours: function(){
        return d3.getHours() - d0.getHours();
      },
      getMinutes: function(){
        return d3.getMinutes() - d0.getMinutes();
      },
      toString: function(){
        return this.getHours() + "Hr:" +
          this.getMinutes() + "Mins"
      },
    };
  };


  fetchFlightDetailsBasedOnSearchCriteria(searchCriteria) {
    this.flightDetails = {
      oneWayFlights: [],
      returnFlights: [],
      searchCriteria: searchCriteria,
    };
    this.http.get('https://tw-frontenders.firebaseio.com/advFlightSearch.json').subscribe((response: any[]) => {
      const multipleOneWay = [];
      for(let flight of response) {
        if(flight.origin === searchCriteria.source && flight.destination !== searchCriteria.destination && flight.date === formatDate(searchCriteria.departureDate)){
          const flightObj = {};
          flightObj['name'] = 'Multiple';
          flightObj['departureTime'] = flight.departureTime;
          flightObj['origin'] = flight.origin;
          flightObj['internalFlights'] = [];
          flightObj['price'] = flight.price;
          for(let fli of response) {
            if(fli.origin === flight.destination && fli.destination === searchCriteria.destination && new Date(fli.date) >= new Date(formatDate(searchCriteria.departureDate)) &&
              (this.dateDiff(flight.arrivalTime, fli.departureTime).getHours() >= 1 || (this.dateDiff(flight.arrivalTime, fli.departureTime).getMinutes()) > 30)) {
              flightObj['internalFlights'].push(flight);
              flightObj['internalFlights'].push(fli);
              flightObj['arrivalTime'] = fli.arrivalTime;
              flightObj['timeDuration'] = this.dateDiff(flight.arrivalTime, fli.departureTime, flight.date, fli.date).toString();
              flightObj['date'] = flight.date;
              flightObj['price'] += fli.price;
              flightObj['destination'] = fli.destination;
              multipleOneWay.push(flightObj);
              break;
            }
          }
        }
      }
      this.flightDetails.oneWayFlights = _.filter(response, (flight) => {
          return flight.origin === searchCriteria.source && flight.destination === searchCriteria.destination && flight.date === formatDate(searchCriteria.departureDate);
      });
      this.flightDetails.oneWayFlights = [ ...this.flightDetails.oneWayFlights, ...multipleOneWay];
      const multiReturnArray = [];
      for(let flight of response) {
        if(flight.origin === searchCriteria.destination && flight.destination !== searchCriteria.source && flight.date === formatDate(searchCriteria.returnDate)){
          const flightObj = {};
          flightObj['name'] = 'Multiple';
          flightObj['departureTime'] = flight.departureTime;
          flightObj['origin'] = flight.origin;
          flightObj['internalFlights'] = [];
          flightObj['price'] = flight.price;
          for(let fli of response) {
            if(fli.origin === flight.destination && fli.destination === searchCriteria.source && new Date(fli.date) >= new Date(formatDate(searchCriteria.returnDate)) &&
              (this.dateDiff(flight.arrivalTime, fli.departureTime).getHours() >= 1 || (this.dateDiff(flight.arrivalTime, fli.departureTime).getMinutes()) > 30)) {
              flightObj['internalFlights'].push(flight);
              flightObj['internalFlights'].push(fli);
              flightObj['arrivalTime'] = fli.arrivalTime;
              flightObj['timeDuration'] = this.dateDiff(flight.arrivalTime, fli.departureTime, flight.date, fli.date).toString();
              flightObj['date'] = flight.date;
              flightObj['price'] += fli.price;
              flightObj['destination'] = fli.destination;
              multiReturnArray.push(flightObj);
              break;
            }
          }
        }
      }
      if(searchCriteria.typeOfTrip === 'return') {
        this.flightDetails.returnFlights = _.filter(response, (flight) => {
          return flight.origin === searchCriteria.destination && flight.destination === searchCriteria.source && flight.date === formatDate(searchCriteria.returnDate);
        });
      }
      this.flightDetails.returnFlights = [ ...this.flightDetails.returnFlights, ...multiReturnArray];
      this.flightDetailsBackUp = this.flightDetails;
      this.flightSource.next(this.flightDetails)
    });
  }

  filterBasedOnMinMaxValue(min, max) {
    this.flightDetails = Object.assign({}, this.flightDetailsBackUp);
    if(this.flightDetails){
      this.flightDetails.oneWayFlights = this.flightDetails.oneWayFlights.filter(flight => flight.price >= min && flight.price <= max);
      if(this.flightDetails.searchCriteria.typeOfTrip === 'return') {
        this.flightDetails.returnFlights = this.flightDetails.returnFlights.filter(flight => flight.price >= min && flight.price <= max);
      }
    }
    this.flightSource.next(this.flightDetails);
  }
}
