import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';

import {HttpClient} from "@angular/common/http";

import {FlightSearchService} from './flight-search.service';


describe('FlightSearchService', () => {
  let service: FlightSearchService;
  let httpTestingController: HttpTestingController;
  const oneWayReturnTripResponse = [{
    "arrivalTime": "6:00",
    "date": "2020/11/01",
    "departureTime": "5:00",
    "destination": "Mumbai (BOM)",
    "flightNo": "AI-101",
    "name": "Air India",
    "origin": "Pune (PNQ)",
    "price": 3525
  }, {
    "arrivalTime": "9:50",
    "date": "2020/11/01",
    "departureTime": "7:20",
    "destination": "Pune (PNQ)",
    "flightNo": "AI-102",
    "name": "Air India",
    "origin": "Mumbai (BOM)",
    "price": 5635
  }]
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(FlightSearchService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it(
    "search should return SearchItems for one way trip",
    fakeAsync(() => {
      let response = oneWayReturnTripResponse;

      const expectedOutput = {
        "oneWayFlights": [{
          "arrivalTime": "6:00",
          "date": "2020/11/01",
          "departureTime": "5:00",
          "destination": "Mumbai (BOM)",
          "flightNo": "AI-101",
          "name": "Air India",
          "origin": "Pune (PNQ)",
          "price": 3525
        }],
        "returnFlights": [],
        "searchCriteria": {"source": "Pune (PNQ)", "destination": "Mumbai (BOM)", "departureDate": "11/1/2020"}
      };

      service.fetchFlightDetailsBasedOnSearchCriteria({
        source: 'Pune (PNQ)',
        destination: 'Mumbai (BOM)',
        departureDate: '11/1/2020',
      });

      // Expect a call to this URL
      const req = httpTestingController.expectOne(
        "https://tw-frontenders.firebaseio.com/advFlightSearch.json"
      );
      expect(req.request.method).toEqual("GET");
      req.flush(response);
      tick();
      expect(service.flightDetails).toEqual(expectedOutput);
    })
  );

  it(
    "search should return SearchItems for return trip",
    fakeAsync(() => {
      let response = oneWayReturnTripResponse;

      const expectedOutput = {
        "oneWayFlights": [{
          "arrivalTime": "6:00",
          "date": "2020/11/01",
          "departureTime": "5:00",
          "destination": "Mumbai (BOM)",
          "flightNo": "AI-101",
          "name": "Air India",
          "origin": "Pune (PNQ)",
          "price": 3525
        }],
        "returnFlights": [{
          "arrivalTime": "9:50",
          "date": "2020/11/01",
          "departureTime": "7:20",
          "destination": "Pune (PNQ)",
          "flightNo": "AI-102",
          "name": "Air India",
          "origin": "Mumbai (BOM)",
          "price": 5635
        }],
        "searchCriteria": {
          "source": "Pune (PNQ)",
          "destination": "Mumbai (BOM)",
          "departureDate": "11/1/2020",
          "returnDate": "11/1/2020",
          "typeOfTrip": "return"
        }
      };
      service.fetchFlightDetailsBasedOnSearchCriteria({
        source: 'Pune (PNQ)',
        destination: 'Mumbai (BOM)',
        departureDate: '11/1/2020',
        returnDate: '11/1/2020',
        typeOfTrip: 'return',
      });
      const req = httpTestingController.expectOne(
        "https://tw-frontenders.firebaseio.com/advFlightSearch.json"
      );
      expect(req.request.method).toEqual("GET");
      req.flush(response);
      tick();

      // Run our tests
      expect(service.flightDetails).toEqual(expectedOutput);
    })
  );

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should filter flight details based on min and max value of slider', async () => {
    fakeAsync(() => {
      let response = oneWayReturnTripResponse;
      service.fetchFlightDetailsBasedOnSearchCriteria({
        source: 'Pune (PNQ)',
        destination: 'Mumbai (BOM)',
        departureDate: '11/1/2020',
      });

      // Expect a call to this URL
      const req = httpTestingController.expectOne(
        "https://tw-frontenders.firebaseio.com/advFlightSearch.json"
      );
      req.flush(response);
      tick();
      service.filterBasedOnMinMaxValue(2000, 4000);
      const expectedOutPut = {
        "oneWayFlights": [{
          "arrivalTime": "6:00",
          "date": "2020/11/01",
          "departureTime": "5:00",
          "destination": "Mumbai (BOM)",
          "flightNo": "AI-101",
          "name": "Air India",
          "origin": "Pune (PNQ)",
          "price": 3525
        }],
        "returnFlights": [],
        "searchCriteria": {"source": "Pune (PNQ)", "destination": "Mumbai (BOM)", "departureDate": "11/1/2020"}
      }
      expect(service.flightDetails).toEqual(expectedOutPut);
    })
  });
});
