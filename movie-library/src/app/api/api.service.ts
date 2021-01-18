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
      params = params.append('movie_name', title);
    }
    if (year) {
      params = params.append('year', year.toString());
    }

    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/search-movies`, { params: params });
  }

  //TODO: Modify
  public searchMoviesByActor(limit: number, offset: number, name?: string): Observable<ActorMovies[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (name) {
      params = params.append('actor', name);
    }

    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/search-by-actor`, { params: params })
      .pipe(map(data => this.mapMoviesToActorMovies(data, name)));
  }

  public searchFavouritesMovies(limit: number, offset: number, title?: string, year?: number): Observable<Movie[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (title) {
      params = params.append('movie_name', title);
    }
    if (year) {
      params = params.append('year', year.toString());
    }

    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/my-movies`, { params: params });
  }

  public searchFavouritesMoviesByActor(limit: number, offset: number, name?: string): Observable<ActorMovies[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (name) {
      params = params.append('actor', name);
    }

    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/my-movies-by-actor`, { params: params })
      .pipe(map(data => this.mapMoviesToActorMovies(data, name)));
  }

  public addToFavouriteMovies(id: string): Observable<any> {
    const body = {
      'id': id
    };
    return this.httpClient.post(`${environment.apiUrl}/add-movie`, body);
  }

  public removeFromFavourites(id: string): Observable<any> {
    return this.httpClient.delete(`${environment.apiUrl}/remove-movie/${id}`)
      .pipe(
        tap(() => {
          this.favouritesService.removeMovieFromFavourites(id);
        })
      )
  }

  private mapMoviesToActorMovies(data: Movie[], name?: string): ActorMovies[] {
    const newData: ActorMovies[] = [];
    const nameLowerCase = name?.toLowerCase();

    for (const movie of data) {
      if (!movie.actors) {
        continue;
      }
      for (const actor of movie.actors) {
        if (nameLowerCase && !actor.name?.toLowerCase().includes(nameLowerCase)) {
          continue;
        }

        newData.push({
          id: movie.id,
          title: movie.title,
          year: movie.year,
          name: actor.name,
          description: actor.description,
          birthYear: actor.birthYear,
          birthPlace: actor.birthPlace,
          movie: movie
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
