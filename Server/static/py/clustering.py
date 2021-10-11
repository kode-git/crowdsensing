import geopandas as gpd
import sqlalchemy as db
import sys
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.cluster import KMeans
import numpy as np
import json
from sklearn.preprocessing import MinMaxScaler
from sklearn import preprocessing
# Create a database connection
engine = db.create_engine(
    "postgresql://postgres:blockchain@localhost:5432/csdb")
con = engine.connect()
# Read PostGIS database with Geopandas.
sql = "select db, coordinates from loc_ref_points"

data = gpd.read_postgis(sql=sql, con=con, geom_col="coordinates")

k = int(sys.argv[1])
input_data = gpd.GeoDataFrame()
input_data['long'] = data['coordinates'].y
input_data['lat'] = data['coordinates'].x


myMaxLong=data['coordinates'].y.max(axis=0)
myMinLong=data['coordinates'].y.min(axis=0)
myRangeLong=myMaxLong-myMinLong
myMaxLat=data['coordinates'].x.max(axis=0)
myMinLat=data['coordinates'].x.min(axis=0)
myRangeLat=myMaxLat-myMinLat
#setting the range for the normalization on the db value
myRange=myRangeLong
if(myRangeLong<myRangeLat):
     myRange=myRangeLat


scaler = MinMaxScaler(feature_range=(0, myRange))

#scaling the db in the max range of lat and lng
input_data['db']= preprocessing.minmax_scale(data['db'],feature_range=(0, myRange))


kmeans = KMeans(n_clusters=k, random_state=520, n_init=40, max_iter=300).fit(input_data)
arr = np.array(kmeans.predict(input_data))
clusters = []
for element in arr:
    clusters.append(element)
jsonClusters = '\"cluster\": {}'.format(clusters)
jsonClusters = "{" + jsonClusters + "}"
# jsonLocations = "'clusters' : {}".format(kmeans.labels_)
print(jsonClusters)
sys.stdout.flush()
