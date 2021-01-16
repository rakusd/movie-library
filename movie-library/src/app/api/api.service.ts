import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FavouritesRemovalSyncService } from '../favourites/favourites-removal-sync.service';
import { ActorMovies } from './actor-movies';
import { Movie } from './movie';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
    private favouritesService: FavouritesRemovalSyncService) { }

  public searchMovies(limit: number, offset: number, title?: string, year?: number): Observable<Movie[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (title) {
      params = params.append('title_like', title);
    }
    if (year) {
      params = params.append('year', year.toString());
    }

    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/movies`, { params: params });
  }

  public searchMoviesByActor(limit: number, offset: number, name?: string): Observable<ActorMovies[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (name) {
      params = params.append('actorName_like', name);
    }

    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/actors`, { params: params })
      .pipe(map(data => this.mapMoviesToActorMovies(data)));
  }

  public searchFavouritesMovies(limit: number, offset: number, title?: string, year?: number): Observable<Movie[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (title) {
      params = params.append('title_like', title);
    }
    if (year) {
      params = params.append('year', year.toString());
    }

    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/favourites`, { params: params });
  }

  public searchFavouritesMoviesByActor(limit: number, offset: number, name?: string): Observable<ActorMovies[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (name) {
      params = params.append('actorName_like', name);
    }

    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/favourites`, { params: params })
      .pipe(map(data => this.mapMoviesToActorMovies(data)));
  }

  public addToFavouriteMovies(id: string): Observable<any> {
    const body = {
      'id': id
    };
    return this.httpClient.post(`${environment.apiUrl}/favourites`, body);
  }

  public removeFromFavourites(id: string): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/favourites/${id}`)
      .pipe(
        tap(() => {
          this.favouritesService.removeMovieFromFavourites(id);
        })
      )
  }

  private mapMoviesToActorMovies(data: Movie[]): ActorMovies[] {
    const newData: ActorMovies[] = [];

    for (const movie of data) {
      if (!movie.actors) {
        continue;
      }
      for (const actor of movie.actors) {
        newData.push({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          name: actor.name,
          description: actor.description,
          birthYear: actor.birthYear,
          birthPlace: actor.birthPlace
        });
      }
    }

    return newData.sort((a, b) => {
      const t1 = a.name || '';
      const t2 = b.name || '';
      if (t1 > t2) {
        return 1;
      }
      if (t1 < t2) {
        return -1;
      }

      const f1 = a.title || '';
      const f2 = b.title || '';

      if (f1 > f2) {
        return 1;
      }
      if (f1 < f2) {
        return -1;
      }

      return 0;
    });
  }
}
