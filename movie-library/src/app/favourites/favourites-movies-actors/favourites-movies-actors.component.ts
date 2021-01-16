import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { SnackbarService } from '../../snackbar.service';
import { ActorMovies } from 'src/app/api/actor-movies';


@Component({
  selector: 'app-favourites-movies-actors',
  templateUrl: './favourites-movies-actors.component.html',
  styleUrls: ['./favourites-movies-actors.component.scss']
})
export class FavouritesMoviesActorsComponent implements OnInit, OnDestroy {

  public displayedColumns = ['actor', 'birthYear', 'birthPlace', 'title', 'remove'];
  public dataSource = new MatTableDataSource<ActorMovies>();
  public loadingData = false;

  destroy$ = new Subject();
  actorNameFilterChanged$ = new Subject<string>();

  actorName: string = '';
  pageSize = 100;
  offset = 0;

  private readonly debounceTime = 500;

  constructor(private api: ApiService, private snackBarService: SnackbarService) { }

  ngOnInit(): void {
    this.loadingData = true;
    this.getFavouritesMoviesByActors();

    this.actorNameFilterChanged$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.actorName = res;
      this.getFavouritesMoviesByActors();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getFavouritesMoviesByActors() {
    this.loadingData = true;
    this.api.searchFavouritesMoviesByActor(this.pageSize, this.offset, this.actorName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.dataSource.data = data;
        this.loadingData = false;
      },
        error => {
          this.loadingData = false;
          console.log(error);
        });
  }

  public filter(event: KeyboardEvent) {
    this.actorNameFilterChanged$.next((<HTMLInputElement>event.target).value);
  }

  public removeFromFavourites(id: string) {
    this.api.removeFromFavourites(id)
      .subscribe(_ => {
        this.dataSource.data = this.dataSource.data.filter(a => a.id !== id);
        this.snackBarService.showMessage('Successfully removed movie from favourites!');
      });
  }
}
