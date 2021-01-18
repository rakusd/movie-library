import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FavouritesSyncService } from '../favourites/favourites-sync.service';
import { ActorMovies } from './actor-movies';
import { Movie } from './movie';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
    private favouritesService: FavouritesSyncService) { }

  public searchMovies(limit: number, offset: number, title?: string, year?: number, useSlowQuery?: boolean): Observable<Movie[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (title) {
      params = params.append('movie_name', title);
    }
    if (year) {
      params = params.append('year', year.toString());
    }
    params = params.append('use_slow_query', useSlowQuery? '1' : '0');
    
    return this.httpClient.get<Movie[]>(`${environment.apiUrl}/search-movies`, { params: params });
  }

  //TODO: Modify
  public searchMoviesByActor(limit: number, offset: number, name?: string, useSlowQuery?: boolean): Observable<ActorMovies[]> {
    let params = new HttpParams();
    params = params.append('limit', limit.toString());
    params = params.append('offset', offset.toString());
    if (name) {
      params = params.append('actor', name);
    }
    params = params.append('use_slow_query', useSlowQuery? '1' : '0');

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

  public addToFavouriteMovies(movie: Movie): Observable<any> {
    const body = {
      'movie': movie
    };
    return this.httpClient.post(`${environment.apiUrl}/add-movie`, body)
      .pipe(
        tap(() => {
          if (movie.id) {
            this.favouritesService.addMovieToFavourites(movie.id);
          }
        })
      )
  }

  public removeFromFavourites(id: string): Observable<any> {
    let params = new HttpParams();
    params = params.append('id', id);

    return this.httpClient.delete(`${environment.apiUrl}/remove-movie`, { params: params })
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
          actorId: actor.id,
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
