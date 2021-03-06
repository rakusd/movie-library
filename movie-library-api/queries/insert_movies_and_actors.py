QUERY = """
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX http: <http://www.w3.org/2011/http#>
PREFIX fo: <http://www.w3.org/1999/XSL/Format#>
prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
prefix foaf: <http://xmlns.com/foaf/0.1/>
prefix db: <http://dbpedia.org/>
prefix db-ont: <http://dbpedia.org/ontology/>
prefix db-prop: <http://dbpedia.org/property/>
prefix lmdb: <http://data.linkedmdb.org/resource/movie/>
prefix purl: <http://purl.org/dc/terms/>
prefix owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

INSERT DATA {{
  GRAPH <http://my.movie.library.com/library> {{
    
    {content}								
}} }}
"""

def prepare_query(movie):
  if movie['title']:
    movie['title'] = movie['title'].replace("'", r"\'")
  queryContent = f"""
    <{movie['id']}> purl:title "{movie['title']}" ;
        lmdb:initial_release_date "{movie['year']}" ;
        a lmdb:film .
  """

  for actor in movie['actors']:
    if actor['description']:
      actor['description'] = actor['description'].replace("'", r"\'")

    if actor['name']:
      actor['name'] = actor['name'].replace("'", r"\'")

    if actor['birthPlace']:
      actor['birthPlace'] = actor['birthPlace'].replace("'", r"\'")

    queryContent += f"""
      \n

      <{movie['id']}> lmdb:actor <{actor['id']}> .

      <{actor['id']}> a lmdb:actor ;
          lmdb:actor_name "{actor['name']}" ;
          {f"db-prop:birthDate '{actor['birthYear']}' ;" if actor['birthYear'] else ""}
          {f"db-prop:birthPlace '{actor['birthPlace']}' ;" if actor['birthPlace'] else ""}
          {f"rdfs:comment '{actor['description']}'" if actor['description'] else ""}
          .
    """

  return QUERY.format(content=queryContent)