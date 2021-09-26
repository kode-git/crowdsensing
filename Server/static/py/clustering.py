
import geopandas as gpd
import sqlalchemy as db
from sklearn.model_selection import train_test_split
import sys
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.cluster import KMeans

# Create a database connection
engine = db.create_engine(
    "postgresql://postgres:blockchain@localhost:5432/csdb")
con = engine.connect()
# Read PostGIS database with Geopandas.
sql = "select db, coordinates from loc_ref_points"

data = gpd.read_postgis(sql=sql, con=con, geom_col="coordinates")
print(len(data))

k = sys.argv[1]

train_data = gpd.GeoDataFrame()

train_data['lat'] = data["coordinates"].x
train_data['lng'] = data["coordinates"].y
train_data['db'] = data['db']


# initialization of clusters
train_result = [0 for x in range(len(train_data['lat']))]


kmeans = KMeans(n_clusters=k, n_init=40)

# Fitting

result = kmeans.fit(train_data, train_result)


print(kmeans.predict(train_data))


sys.stdout.flush()
