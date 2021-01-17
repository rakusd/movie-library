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

SELECT DISTINCT ?movie
WHERE {{	
  ?actor lmdb:actor_name ?actor_name .
  ?movie lmdb:actor ?actor ;
         a lmdb:film .
  
  FILTER (CONTAINS(LCASE(?actor_name), LCASE('{actor}'))) 
}} 
LIMIT {limit} OFFSET {offset}
"""