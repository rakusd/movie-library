import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { SnackbarService } from '../../snackbar.service';
import { ActorMovies } from 'src/app/api/actor-movies';
import { environment } from '../../../environments/environment';
import { MatPaginator } from '@angular/material/paginator';
import { FavouritesSyncService } from 'src/app/favourites/favourites-sync.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-explore-movie-actors',
  templateUrl: './explore-movie-actors.component.html',
  styleUrls: ['./explore-movie-actors.component.scss']
})
export class ExploreMovieActorsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  public displayedColumns = ['actor', 'birthYear', 'birthPlace', 'title', 'add'];
  public dataSource = new MatTableDataSource<ActorMovies>();
  public loadingData = false;

  public showDetails = false;
  public selectedActor: ActorMovies = {};

  stop$ = new Subject();
  destroy$ = new Subject();
  actorNameFilterChanged$ = new Subject<string>();

  actorName: string = '';
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

    this.actorNameFilterChanged$.pipe(
      debounceTime(environment.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.actorName = res;
      this.getMoviesByActors();
    });

    this.favouritesService.movieAddedToFavourites$
    .pipe(takeUntil(this.destroy$))
    .subscribe((id) => {
      for (const el of this.dataSource.data) {
        if (el.id === id && el.movie) {
          el.movie.favourite = true;
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

  public getMoviesByActors() {
    if (!this.isInitialized) {
      return;
    }

    this.cancelOngoingRequests();
    this.showDetails = false;
    this.loadingData = true;
    this.api.searchMoviesByActor(environment.pageSize, this.offset, this.actorName, this.useSlowQuery)
      .pipe(takeUntil(this.stop$))
      .subscribe(data => {
        for (const it of data) {
          if (it.id && it.movie) {
            if (this.favouriteMovies.has(it.id)) {
              it.movie.favourite = true;
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
    this.actorNameFilterChanged$.next((<HTMLInputElement>event.target).value);
  }

  public addToFavourites(element: ActorMovies) {
    if (!element.id || !element.movie || element.movie?.favourite) {
      return;
    }

    this.api.addToFavouriteMovies(element.movie)
      .subscribe(_ => {
        this.snackBarService.showMessage('Successfully added movie to favourites!')
      });
  }

  public rowClicked(row: ActorMovies) {
    this.showDetails = true;
    this.selectedActor = row;
  }

  public querySpeedChanged(event: MatSlideToggleChange) {
    this.useSlowQuery = event.checked;
    this.getMoviesByActors();
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
        this.getMoviesByActors();
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
