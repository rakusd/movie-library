QUERY = """
prefix foaf: <http://xmlns.com/foaf/0.1/>
prefix db: <http://dbpedia.org/>
prefix lmdb: <http://data.linkedmdb.org/resource/movie/>
prefix purl: <http://purl.org/dc/terms/>
prefix owl: <http://www.w3.org/2002/07/owl#>

SELECT DISTINCT ?movie
WHERE {{
  ?movie a lmdb:film ;
         purl:title ?title ;
         lmdb:initial_release_date ?release_date .

  {title_filter}  
  {year_filter}
}}
ORDER BY ?movie
LIMIT {limit} OFFSET {offset}
"""

TITLE_FILTER = """
FILTER (CONTAINS(LCASE(?title), LCASE('{movie_name}')))
"""

YEAR_FILTER = """
FILTER (STRSTARTS(?release_date, '{year}')) 
"""

