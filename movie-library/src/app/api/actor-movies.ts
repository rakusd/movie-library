import { Movie } from "./movie";

export class ActorMovies {
    // Movie
    id?: string;
    title?: string;
    year?: string;

    // Actor
    name?: string;
    description?: string;
    birthYear?: string;
    birthPlace? :string;

    // Original data
    movie?: Movie;
}