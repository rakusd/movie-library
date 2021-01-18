import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavouritesSyncService {

  public movieAddedToFavourites$ = new Subject<string>();
  public movieRemovedFromFavourites$ = new Subject<string>();

  constructor() { }

  public addMovieToFavourites(id: string) {
    this.movieAddedToFavourites$.next(id);
  }

  public removeMovieFromFavourites(id: string) {
    this.movieRemovedFromFavourites$.next(id);
  }
}
