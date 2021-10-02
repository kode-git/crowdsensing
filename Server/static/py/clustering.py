
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


k = int(sys.argv[1])
input_data = gpd.GeoDataFrame()
input_data['lat'] = data['coordinates'].y
input_data['lng'] = data['coordinates'].x
input_data['db'] = data['db']


# initialization of clusters
clusters = np.array([0 for x in range(len(input_data['lat']))])


kmeans = KMeans(n_clusters=k, n_init=40)

# Fitting
result = kmeans.fit(input_data, clusters)

# writing in the stdout stream

print(kmeans.predict(input_data))
sys.stdout.flush()
