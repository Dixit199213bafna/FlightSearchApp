import { Component, OnInit } from '@angular/core';
import {FlightSearchService} from "../services/flight-search.service";

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.component.html',
  styleUrls: ['./flight-detail.component.css']
})
export class FlightDetailComponent implements OnInit {
  flightDetails;
  date;
  constructor(public flightSearchService: FlightSearchService) {
    this.date = new Date();
  }

  showFlightDetails(event,flight) {
    event.preventDefault();
    flight.showDetails = !flight.showDetails;
  }

  ngOnInit(): void {
    this.flightSearchService.currentFlights.subscribe(flightDetails => this.flightDetails = flightDetails);
  }

}
