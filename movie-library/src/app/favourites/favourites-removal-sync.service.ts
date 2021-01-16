import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavouritesRemovalSyncService {

  public movieRemovedFromFavourites$ = new Subject<string>();

  constructor() { }

  public removeMovieFromFavourites(id: string) {
    this.movieRemovedFromFavourites$.next(id);
  }
}
