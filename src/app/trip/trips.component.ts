import { Component , OnInit , Inject } from '@angular/core';
import { Router } from '@angular/router';
import { Trip } from './trip';
import { TripService } from './trip.service';
import { AngularFire, FirebaseApp } from 'angularfire2';
import { FirebaseListObservable } from 'angularfire2';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
  selector: 'trips',
  templateUrl: 'trips.component.html',
})
export class TripsComponent implements OnInit {
  selectedTrip: Trip;
  trips: FirebaseListObservable<any[]>;
  path: string ='/trips';
  userData: any;
  hiddenChat: boolean = false ;

  constructor(@Inject(FirebaseApp) firebaseApp: any , private tripService: TripService ,
    private af: AngularFire , private _flashMessagesService: FlashMessagesService , private router: Router) {
   }

 	ngOnInit(): void {
    this.trips = this.tripService.getTrips();
    this.af.auth.subscribe(auth => {
          this.userData = auth;
        });
  }

  onSelect(trip: Trip): void {
    this.selectedTrip = trip;
  }

  addTripper(trip: Trip): void {
    this.selectedTrip = trip;

    //check if login
    if(this.userData == null) {
      this._flashMessagesService.grayOut(true);
      this._flashMessagesService.show('You must Login first', { cssClass: 'alert-danger', timeout: 3000 });
      this.router.navigate(['login']);
    }

    //check user is duplicated in the array
    if(this.selectedTrip.trippers.length > 0 && trip.trippers.indexOf(this.userData.auth.uid) > -1) {
      this._flashMessagesService.grayOut(true);
      this._flashMessagesService.show('You are already in the list', { cssClass: 'alert-danger', timeout: 3000 });
      this.router.navigate(['/']);
    }

    //check if the user is the creator of trip
    if(trip.uid == this.userData.auth.uid ){
      this._flashMessagesService.grayOut(true);
      this._flashMessagesService.show('You are the creator of this trip!', { cssClass: 'alert-danger', timeout: 3000 });
    }
    //if not , check if the array contains any previus tripper
    else{
      if(this.selectedTrip.trippers.length > 0){   
       this.selectedTrip.trippers.push(this.userData.auth.uid);
      }
      else{
    //the array is empty, push new tripper
       this.selectedTrip.trippers = [this.userData.auth.uid]
      }
      this.tripService.updateTrippers(this.selectedTrip);
      this._flashMessagesService.grayOut(true);
      this._flashMessagesService.show('Great!, you are now in tripper list', { cssClass: 'alert-success', timeout: 3000 });
      this.router.navigate(['/']);
    }
  }

  chat(trip){
    if (this.userData){
      // console.log(trip.$key);
      // this.router.navigate(['chat' , trip.$key]);
      this.hiddenChat = true;
    }
  }

}
