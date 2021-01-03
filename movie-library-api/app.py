from flask import Flask, request
from .helpers import param_helpers

app = Flask(__name__)

@app.route('/search-movies')
def search_movies():
    movie_name = param_helpers.ensure_string(request.args.get('movie_name'))

@app.route('/search-by-actor')
def search_by_actor():
    pass