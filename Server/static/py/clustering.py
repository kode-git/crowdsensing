import geopandas as gpd
import sqlalchemy as db
import sys
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.cluster import KMeans
import numpy as np
import json
# Create a database connection

engine = db.create_engine(
    "postgresql://postgres:blockchain@localhost:5432/csdb")
con = engine.connect()
# Read PostGIS database with Geopandas.
sql = "select db, coordinates from loc_ref_points"

data = gpd.read_postgis(sql=sql, con=con, geom_col="coordinates")

k = sys.argv[1]
input_data = gpd.GeoDataFrame()
input_data['long'] = data['coordinates'].y
input_data['lat'] = data['coordinates'].x
input_data['db'] = data['db']
kmeans = KMeans(n_clusters=k, random_state=520, n_init=40, max_iter=300).fit(input_data)

jsonLocations = "clusters : {}".format(kmeans.labels_)
print("{" + jsonLocations + "}")

sys.stdout.flush()
