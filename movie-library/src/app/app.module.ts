import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExploreComponent } from './explore/explore.component';
import { AngularMaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FavouritesComponent } from './favourites/favourites.component';
import { ExploreMoviesComponent } from './explore/explore-movies/explore-movies.component';
import { ExploreMovieActorsComponent } from './explore/explore-movie-actors/explore-movie-actors.component';
import { FavouritesMoviesComponent } from './favourites/favourites-movies/favourites-movies.component';
import { FavouritesMoviesActorsComponent } from './favourites/favourites-movies-actors/favourites-movies-actors.component';
import { ActorDetailsComponent } from './actor-details/actor-details.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ExploreComponent,
    FavouritesComponent,
    ExploreMoviesComponent,
    ExploreMovieActorsComponent,
    FavouritesMoviesComponent,
    FavouritesMoviesActorsComponent,
    ActorDetailsComponent,
    MovieDetailsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    AngularMaterialModule,
    FlexLayoutModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
