import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { SnackbarService } from '../../snackbar.service';
import { ActorMovies } from 'src/app/api/actor-movies';
import { environment } from '../../../environments/environment';
import { MatPaginator } from '@angular/material/paginator';

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

  destroy$ = new Subject();
  actorNameFilterChanged$ = new Subject<string>();

  actorName: string = '';
  offset = 0;

  constructor(
    private api: ApiService,
    private snackBarService: SnackbarService) { }

  ngOnInit(): void {
    this.loadingData = true;
    this.getMoviesByActors();

    this.actorNameFilterChanged$.pipe(
      debounceTime(environment.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.actorName = res;
      this.getMoviesByActors();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getMoviesByActors() {
    this.showDetails = false;
    this.loadingData = true;
    this.api.searchMoviesByActor(environment.pageSize, this.offset, this.actorName)
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

  public addToFavourites(id: string) {
    this.api.addToFavouriteMovies(id)
      .subscribe(_ => {
        this.snackBarService.showMessage('Successfully added movie to favourites!')
      });
  }

  public rowClicked(row: ActorMovies) {
    this.showDetails = true;
    this.selectedActor = row;
  }
}
