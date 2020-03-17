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
    const flightDetails = {
      oneWayFlights: [],
      returnFlights: [],
      searchCriteria: searchCriteria,
    };
    this.http.get('https://tw-frontenders.firebaseio.com/advFlightSearch.json').subscribe((response: any[]) => {
      const multipleOneWay = [];
      for(let i=1; i<response.length; i++) {
        if(response[i].origin === searchCriteria.source && response[i].destination !== searchCriteria.destination && response[i].date === formatDate(searchCriteria.departureDate)) {
          const obj = {};
          obj['name'] = 'Multiple';
          obj['departureTime'] = response[i].departureTime;
          obj['origin'] = response[i].origin;
          obj['internalFlights'] = [];
          obj['price'] = response[i].price;
          for( let j = 1; j < response.length ; j++) {
            if(response[j].origin === response[i].destination && response[j].destination === searchCriteria.destination && new Date(response[j].date) >= new Date(formatDate(searchCriteria.departureDate))
            && (this.dateDiff(response[i].arrivalTime, response[j].departureTime).getHours() >=1 || (this.dateDiff(response[i].arrivalTime, response[j].departureTime).getMinutes() > 30))) {
              obj['internalFlights'].push(response[i]);
              obj['internalFlights'].push(response[j]);
              obj['arrivalTime'] = response[j].arrivalTime;
              obj['timeDuration'] = this.dateDiff(response[i].arrivalTime, response[j].departureTime, response[i].date, response[j].date).toString();
              obj['date'] = response[i].date;
              obj['price'] += response[j].price;
              obj['destination'] = response[j].destination;
              multipleOneWay.push(obj);
              break;
            }
          }
        }
      }
      console.log(multipleOneWay);
      flightDetails.oneWayFlights = _.filter(response, (flight) => {
          return flight.origin === searchCriteria.source && flight.destination === searchCriteria.destination && flight.date === formatDate(searchCriteria.departureDate);
      });
      // const a = response.map(flight => {
      //   if(flight.origin === searchCriteria.source && flight.destination !== searchCriteria.destination && flight.date === formatDate(searchCriteria.departureDate)){
      //     const flightObj = {};
      //     flightObj['name'] = 'Multiple';
      //     flightObj['departureTime'] = flight.departureTime;
      //     flightObj['origin'] = flight.origin;
      //     flightObj['internalFlights'] = [];
      //     flightObj['price'] = flight.price;
      //     response.forEach(fli => {
      //       if(fli.origin === flight.destination && fli.destination === searchCriteria.destination && new Date(fli.date) >= new Date(formatDate(searchCriteria.departureDate)) &&
      //         (this.dateDiff(flight.arrivalTime, fli.departureTime).getHours() >= 1 || (this.dateDiff(flight.arrivalTime, fli.departureTime).getMinutes()) > 30)) {
      //         flightObj['internalFlights'].push(flight);
      //         flightObj['internalFlights'].push(fli);
      //         flightObj['arrivalTime'] = fli.arrivalTime;
      //         flightObj['timeDuration'] = this.dateDiff(flight.arrivalTime, fli.departureTime, flight.date, fli.date).toString();
      //         flightObj['date'] = flight.date;
      //         flightObj['price'] += fli.price;
      //         flightObj['destination'] = fli.destination;
      //         return flightObj;
      //       }
      //     })
      //   }
      // });
      // console.log(a);
      flightDetails.oneWayFlights = [ ...flightDetails.oneWayFlights, ...multipleOneWay];
      const multiReturnArray = []
      for(let i=1; i<response.length; i++) {
        if(response[i].origin === searchCriteria.destination && response[i].destination !== searchCriteria.source && response[i].date === formatDate(searchCriteria.returnDate)) {
          const obj = {};
          obj['name'] = 'Multiple';
          obj['departureTime'] = response[i].departureTime;
          obj['origin'] = response[i].origin;
          obj['internalFlights'] = [];
          obj['price'] = response[i].price;
          for( let j = 1; j < response.length ; j++) {
            if(response[j].origin === response[i].destination && response[j].destination === searchCriteria.source && new Date(response[j].date) >= new Date(formatDate(searchCriteria.returnDate))
              && (this.dateDiff(response[i].arrivalTime, response[j].departureTime).getHours() >=1 || (this.dateDiff(response[i].arrivalTime, response[j].departureTime).getMinutes() > 30))) {
              obj['internalFlights'].push(response[i]);
              obj['internalFlights'].push(response[j]);
              obj['arrivalTime'] = response[j].arrivalTime;
              obj['timeDuration'] = this.dateDiff(response[i].arrivalTime, response[j].departureTime, response[i].date, response[j].date).toString();
              obj['date'] = response[i].date;
              obj['price'] += response[j].price;
              obj['destination'] = response[j].destination;
              multiReturnArray.push(obj);
              break;
            }
          }
        }
      }
      if(searchCriteria.typeOfTrip === 'return') {
        flightDetails.returnFlights = _.filter(response, (flight) => {
          return flight.origin === searchCriteria.destination && flight.destination === searchCriteria.source && flight.date === formatDate(searchCriteria.returnDate);
        });
      }
      flightDetails.returnFlights = [ ...flightDetails.returnFlights, ...multiReturnArray];
      this.flightSource.next(flightDetails)
    });
  }
}
