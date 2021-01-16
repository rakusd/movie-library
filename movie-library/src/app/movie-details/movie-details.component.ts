import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Actor } from '../api/actor';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss']
})
export class MovieDetailsComponent implements OnInit {

  @Input() movieTitle?: string = '';

  _actors: Actor[] = [];
  get actors(): Actor[] {
      return this.actors;
  }
  @Input() set actors(value: Actor[]) {
      this._actors = value;
      this.dataSource.data = this._actors;
  }

  public displayedColumns = ['actor', 'birthYear', 'birthPlace'];
  public dataSource = new MatTableDataSource<Actor>();

  constructor() { }

  ngOnInit(): void {
  }

}
