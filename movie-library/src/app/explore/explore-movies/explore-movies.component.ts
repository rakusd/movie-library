import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { Movie } from '../../api/movie';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { SnackbarService } from '../../snackbar.service';
import { environment } from '../../../environments/environment';
import { Actor } from 'src/app/api/actor';
import { MatPaginator } from '@angular/material/paginator';
import { FavouritesSyncService } from 'src/app/favourites/favourites-sync.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-explore-movies',
  templateUrl: './explore-movies.component.html',
  styleUrls: ['./explore-movies.component.scss']
})
export class ExploreMoviesComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  public displayedColumns = ['title', 'year', 'add'];
  public dataSource = new MatTableDataSource<Movie>();
  public loadingData = false;

  public showDetails = false;
  public selectedMovie: Movie = {};
  public selectedMovieActors: Actor[] = [];

  stop$ = new Subject();
  destroy$ = new Subject();
  titleFilterChanged$ = new Subject<string>();
  yearFilterChanged$ = new Subject<number>();

  titleFilter: string = '';
  yearFilter?: number;
  offset = 0;
  useSlowQuery = false;

  private favouriteMovies: Set<string> = new Set<string>();
  private isInitialized = false;

  constructor(
    private api: ApiService,
    private snackBarService: SnackbarService,
    private favouritesService: FavouritesSyncService) { }

  ngOnInit(): void {
    this.loadingData = true;
    this.initComponent();

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

    this.favouritesService.movieAddedToFavourites$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        for (const el of this.dataSource.data) {
          if (el.id === id) {
            el.favourite = true;
          }
        }
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.stop$.next();
    this.stop$.complete();

    this.destroy$.next();
    this.destroy$.complete();
  }

  public getMovies() {
    if (!this.isInitialized) {
      return;
    }

    this.cancelOngoingRequests();
    this.loadingData = true;
    this.showDetails = false;
    this.api.searchMovies(environment.pageSize, this.offset, this.titleFilter, this.yearFilter, this.useSlowQuery)
      .pipe(takeUntil(this.stop$))
      .subscribe(data => {
        for (const it of data) {
          if (it.id) {
            if (this.favouriteMovies.has(it.id)) {
              it.favourite = true;
            }
          }
        }

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

  public addToFavourites(movie: Movie) {
    if (!movie.id || movie.favourite) {
      return;
    }

    this.api.addToFavouriteMovies(movie)
      .subscribe(_ => {
        this.snackBarService.showMessage('Successfully added movie to favourites!')
      });
  }

  public rowClicked(row: Movie) {
    this.showDetails = true;
    this.selectedMovie = row;
    this.selectedMovieActors = row.actors || [];
  }

  public querySpeedChanged(event: MatSlideToggleChange) {
    this.useSlowQuery = event.checked;
    this.getMovies();
  }

  private initComponent() {
    this.api.searchFavouritesMovies(environment.bigPageSize, 0)
      .pipe(takeUntil(this.stop$))
      .subscribe(data => {
        for (const item of data) {
          if (item.id) {
            this.favouriteMovies.add(item.id);
          }
        }
        this.isInitialized = true;
        this.getMovies();
      },
        error => {
          this.isInitialized = true;
          console.log(error);
        });
  }

  private cancelOngoingRequests() {
    this.stop$.next();
  }
}
