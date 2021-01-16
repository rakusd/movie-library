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

SELECT *
WHERE {{	
   
  VALUES (?movie) {{ {movie_ids} }}
  ?movie lmdb:actor ?actor ;
      purl:title ?title ;
      lmdb:initial_release_date ?release_date .
  ?actor lmdb:actor_name ?actor_name .
  
  OPTIONAL {{ 
  	?actor owl:sameAs ?dbpedia_ref . 
   	FILTER( STRSTARTS(STR(?dbpedia_ref), 'http://dbpedia.org/'))
    
    SERVICE <http://dbpedia.org/sparql/> {{
      ?dbpedia_ref db-ont:wikiPageID ?xd .
      OPTIONAL {{
        ?dbpedia_ref rdfs:comment ?actor_description .
        FILTER(LANG(?actor_description) = "en")
      }}
    
      OPTIONAL {{
        ?dbpedia_ref db-prop:birthDate ?actor_birth_date .
      }}
      
      OPTIONAL {{
        ?dbpedia_ref db-prop:birthPlace ?actor_birth_place .
        FILTER(LANG(?actor_birth_place) = "en")
      }}
   }}
  }}
}}
"""