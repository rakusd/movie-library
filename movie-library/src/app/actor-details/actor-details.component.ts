import { Component, Input, OnInit } from '@angular/core';
import { ActorMovies } from '../api/actor-movies';

@Component({
  selector: 'app-actor-details',
  templateUrl: './actor-details.component.html',
  styleUrls: ['./actor-details.component.scss']
})
export class ActorDetailsComponent implements OnInit {

  @Input() actor: ActorMovies = {};
  constructor() { }

  ngOnInit(): void {
  }

}
