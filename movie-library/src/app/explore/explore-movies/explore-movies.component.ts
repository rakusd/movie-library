import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { ApiService } from '../../api/api.service';
import { Movie } from '../../api/movie';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators'
import { SnackbarService } from '../../snackbar.service';

@Component({
  selector: 'app-explore-movies',
  templateUrl: './explore-movies.component.html',
  styleUrls: ['./explore-movies.component.scss']
})
export class ExploreMoviesComponent implements OnInit, OnDestroy {

  public displayedColumns = ['title', 'year', 'add'];
  public dataSource = new MatTableDataSource<Movie>();
  public loadingData = false;

  destroy$ = new Subject();
  titleFilterChanged$ = new Subject<string>();
  yearFilterChanged$ = new Subject<number>();

  titleFilter: string = '';
  yearFilter?: number;
  pageSize = 100;
  offset = 0;

  private readonly debounceTime = 500;

  constructor(private api: ApiService, private snackBarService: SnackbarService) { }

  ngOnInit(): void {
    this.loadingData = true;
    this.getMovies();

    this.titleFilterChanged$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.titleFilter = res;
      this.getMovies();
    });

    this.yearFilterChanged$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((res) => {
      this.getMovies();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public getMovies() {
    this.loadingData = true;
    this.api.searchMovies(this.pageSize, this.offset, this.titleFilter, this.yearFilter)
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

  public addToFavourites(id: string) {
    this.api.addToFavouriteMovies(id)
      .subscribe(_ => {
        this.snackBarService.showMessage('Successfully added movie to favourites!')
      });
  }
}
