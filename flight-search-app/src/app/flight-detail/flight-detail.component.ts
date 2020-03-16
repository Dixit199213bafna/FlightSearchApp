import { Component, OnInit } from '@angular/core';
import {FlightSearchService} from "../services/flight-search.service";

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.component.html',
  styleUrls: ['./flight-detail.component.css']
})
export class FlightDetailComponent implements OnInit {
  flightDetails;
  constructor(private flightSearchService: FlightSearchService) { }

  ngOnInit(): void {
    this.flightSearchService.currentFlights.subscribe(flightDetails => this.flightDetails = flightDetails);
  }

}
