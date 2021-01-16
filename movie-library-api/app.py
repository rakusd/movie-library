from flask import Flask, request, jsonify
from helpers import param_helpers
from SPARQLWrapper import SPARQLWrapper, CSV, JSON
import pandas as pd
import numpy as np
from io import BytesIO
import json

import queries.fetch_movie_ids_by_movie as fmidbm
import queries.fetch_movies as fm
import queries.fetch_movie_ids_by_actor as fmiba
import queries.insert_movies_and_actors as imaa
import queries.delete_movie as dm
import queries.fetch_actor_movie_count as famc
import queries.delete_actors as da
import queries.my_movie_ids_by_actor as mmiba
import queries.my_movie_ids_by_movie as mmidbm
import queries.my_movies as mm

SPARQL_ENDPOINT = "http://localhost:3030/movies-database/sparql"

def query_and_get_df(sparql):
    sparql.setReturnFormat(CSV)
    results = sparql.query().convert()
    return pd.read_csv(BytesIO(results), sep=',').replace({np.nan: None})

app = Flask(__name__)

def get_movies_and_actors(movie_id_df):
    movie_ids_str = " ".join("(<" + movie_id_df['movie'].values + ">)")

    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(fm.QUERY.format(movie_ids=movie_ids_str))
    
    results = query_and_get_df(sparql)
    unique_movies = results[['movie','title','release_date']].drop_duplicates()
    
    response = []
    for _, row in unique_movies.iterrows():
        response.append({
            'id': row['movie'],
            'title': row['title'],
            'year': row['release_date'],
            'actors': [{
                'name': actor_row['actor_name'],
                'description': actor_row['actor_description'],
                'birthYear': actor_row['actor_birth_date'],
                'birthPlace': actor_row['actor_birth_place']
            } for _, actor_row in results[results['movie']==row['movie']].iterrows()]
        })
    
    return response

def get_my_movies_and_actors(movie_id_df):
    movie_ids_str = " ".join("(<" + movie_id_df['movie'].values + ">)")

    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(mm.QUERY.format(movie_ids=movie_ids_str))
    
    results = query_and_get_df(sparql)
    unique_movies = results[['movie','title','release_date']].drop_duplicates()
    
    response = []
    for _, row in unique_movies.iterrows():
        response.append({
            'id': row['movie'],
            'title': row['title'],
            'year': row['release_date'],
            'actors': [{
                'name': actor_row['actor_name'],
                'description': actor_row['actor_description'],
                'birthYear': actor_row['actor_birth_date'],
                'birthPlace': actor_row['actor_birth_place']
            } for _, actor_row in results[results['movie']==row['movie']].iterrows()]
        })
    
    return response

@app.route('/search-movies')
def search_movies():
    movie_name = param_helpers.ensure_string(request.args.get('movie_name'), None)
    year = param_helpers.ensure_int(request.args.get('year'), None)
    limit = param_helpers.ensure_int(request.args.get('limit'), 20)
    offset = param_helpers.ensure_int(request.args.get('offset'), 0)

    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(fmidbm.QUERY.format(
        title_filter=fmidbm.TITLE_FILTER.format(movie_name=movie_name) if movie_name else '', 
        year_filter=fmidbm.YEAR_FILTER.format(year=year) if type(year) is int else '',
        limit=limit, 
        offset=offset))
    
    movie_id_df = query_and_get_df(sparql)

    return jsonify(get_movies_and_actors(movie_id_df))

@app.route('/my-movies')
def search_movies():
    movie_name = param_helpers.ensure_string(request.args.get('movie_name'), None)
    year = param_helpers.ensure_int(request.args.get('year'), None)
    limit = param_helpers.ensure_int(request.args.get('limit'), 20)
    offset = param_helpers.ensure_int(request.args.get('offset'), 0)

    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(mm.QUERY.format(
        title_filter=mm.TITLE_FILTER.format(movie_name=movie_name) if movie_name else '', 
        year_filter=mm.YEAR_FILTER.format(year=year) if type(year) is int else '',
        limit=limit, 
        offset=offset))
    
    movie_id_df = query_and_get_df(sparql)

    return jsonify(get_my_movies_and_actors(movie_id_df))

@app.route('/search-by-actor')
def search_by_actor():
    actor = param_helpers.ensure_string(request.args.get('actor'))
    limit = param_helpers.ensure_int(request.args.get('limit'), 20)
    offset = param_helpers.ensure_int(request.args.get('offset'), 0)

    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(fmiba.QUERY.format(
        actor=actor,
        limit=limit,
        offset=offset
    ))

    movie_id_df = query_and_get_df(sparql)

    return jsonify(get_movies_and_actors(movie_id_df))

@app.route('/my-movies-by-actor')
def my_movies_by_actor():
    actor = param_helpers.ensure_string(request.args.get('actor'))
    limit = param_helpers.ensure_int(request.args.get('limit'), 20)
    offset = param_helpers.ensure_int(request.args.get('offset'), 0)

    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(mmiba.QUERY.format(
        actor=actor,
        limit=limit,
        offset=offset
    ))

    movie_id_df = query_and_get_df(sparql)

    return jsonify(get_my_movies_and_actors(movie_id_df))

@app.route('/add-movie', method="POST")
def add_movie():
    id = param_helpers.ensure_string(request.json['id'])
    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(imaa.QUERY.format(id=id))
    sparql.query()

    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

@app.route('/remove-movie', method="DELETE")
def remove_movie():
    id = param_helpers.ensure_string(request.json['id'])

    # Check if actors played in other movies
    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(famc.QUERY.format(id=id))
    actors_df = query_and_get_df(sparql)
    
    # Remove movie
    sparql = SPARQLWrapper(SPARQL_ENDPOINT)
    sparql.setQuery(dm.QUERY.format(id=id))
    sparql.query()

    # Remove actors
    actors_to_remove = actors_df[[actors_df]['count'] == 1]['actor'].values
    if len(actors_to_remove) > 0 :
        actor_ids_str = " ".join("(<" + actors_to_remove + ">)")
        sparql = SPARQLWrapper(SPARQL_ENDPOINT)
        sparql.setQuery(da.QUERY.format(actor_ids=actor_ids_str))
        sparql.query()

    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}