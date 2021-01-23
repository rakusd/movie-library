import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { SnackbarService } from '../../snackbar.service';
import { ActorMovies } from 'src/app/api/actor-movies';
import { environment } from '../../../environments/environment';
import { FavouritesSyncService } from '../favourites-sync.service';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-favourites-movies-actors',
  templateUrl: './favourites-movies-actors.component.html',
  styleUrls: ['./favourites-movies-actors.component.scss']
})
export class FavouritesMoviesActorsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

  public displayedColumns = ['actor', 'birthYear', 'birthPlace', 'title', 'remove'];
  public dataSource = new MatTableDataSource<ActorMovies>();
  public loadingData = false;

  public showDetails = false;
  public selectedActor: ActorMovies = {};

  stop$ = new Subject();
  destroy$ = new Subject();
  actorNameFilterChanged$ = new Subject<string>();

  actorName: string = '';
  offset = 0;

  constructor(
    private api: ApiService,
    private snackBarService: SnackbarService,
    private favouritesService: FavouritesSyncService) { }

  ngOnInit(): void {
    this.loadingData = true;
    this.getFavouritesMoviesByActors();

    this.actorNameFilterChanged$.pipe(
      debounceTime(environment.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.actorName = res;
      this.getFavouritesMoviesByActors();
    });

    this.favouritesService.movieRemovedFromFavourites$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.dataSource.data = this.dataSource.data.filter(a => a.id !== id);
        if (this.selectedActor && this.selectedActor.id === id) {
          this.showDetails = false;
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

  public getFavouritesMoviesByActors() {
    this.cancelOngoingRequests();
    this.showDetails = false;
    this.loadingData = true;
    this.api.searchFavouritesMoviesByActor(environment.pageSize, this.offset, this.actorName)
      .pipe(takeUntil(this.stop$))
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
        this.snackBarService.showMessage('Successfully removed movie from favourites!');
      });
  }

  public rowClicked(row: ActorMovies) {
    this.showDetails = true;
    this.selectedActor = row;
  }

  private cancelOngoingRequests() {
    this.stop$.next();
  }
}
