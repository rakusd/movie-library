import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { Movie } from '../../api/movie';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { SnackbarService } from '../../snackbar.service';
import { environment } from '../../../environments/environment';
import { Actor } from 'src/app/api/actor';
import { FavouritesRemovalSyncService } from '../favourites-removal-sync.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-favourites-movies',
  templateUrl: './favourites-movies.component.html',
  styleUrls: ['./favourites-movies.component.scss']
})
export class FavouritesMoviesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  public displayedColumns = ['title', 'year', 'remove'];
  public dataSource = new MatTableDataSource<Movie>();
  public loadingData = false;

  public showDetails = false;
  public selectedMovie: Movie = {};
  public selectedMovieActors: Actor[] = [];

  destroy$ = new Subject();
  titleFilterChanged$ = new Subject<string>();
  yearFilterChanged$ = new Subject<number>();

  titleFilter: string = '';
  yearFilter?: number;
  offset = 0;

  constructor(
    private api: ApiService,
    private snackBarService: SnackbarService,
    private favouritesService: FavouritesRemovalSyncService) { }

  ngOnInit(): void {
    this.loadingData = true;
    this.getMovies();

    this.titleFilterChanged$.pipe(
      debounceTime(environment.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.titleFilter = res;
      this.getMovies();
    });

    this.yearFilterChanged$.pipe(
      debounceTime(environment.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.getMovies();
    });

    this.favouritesService.movieRemovedFromFavourites$
    .pipe(takeUntil(this.destroy$))
    .subscribe((id) => {
      this.dataSource.data = this.dataSource.data.filter(a => a.id !== id);
      if (this.selectedMovie && this.selectedMovie.id === id) {
        this.showDetails = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getMovies() {
    this.loadingData = true;
    this.showDetails = false;
    this.api.searchFavouritesMovies(environment.pageSize, this.offset, this.titleFilter, this.yearFilter)
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
    this.titleFilterChanged$.next((<HTMLInputElement>event.target).value);
  }

  public filterYear() {
    this.yearFilterChanged$.next(this.yearFilter);
  }

  public removeFromFavourites(id: string) {
    this.api.removeFromFavourites(id)
      .subscribe(_ => {
        this.snackBarService.showMessage('Successfully removed movie from favourites!');
      });
  }

  public rowClicked(row: Movie) {
    this.showDetails = true;
    this.selectedMovie = row;
    this.selectedMovieActors = row.actors || [];
  }
}
