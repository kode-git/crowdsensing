import geopandas as gpd
import sqlalchemy as db
from sklearn.model_selection import train_test_split
import sys
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.linear_model import BayesianRidge

# Create a database connection
engine = db.create_engine(
    "postgresql://postgres:blockchain@localhost:5432/csdb")
con = engine.connect()
# Read PostGIS database with Geopandas.
sql = "select id,coordinates,db from loc_ref_points;"
data = gpd.read_postgis(sql=sql, con=con, geom_col="coordinates")

train_data = gpd.GeoDataFrame()

train_data['lat'] = data["coordinates"].x
train_data['lng'] = data["coordinates"].y
train_result = data['db']

X_train, X_test, y_train, y_test = train_test_split(
    train_data, train_result, test_size=0.25, random_state=10)

regB = BayesianRidge()
#Train
regB.fit(X_train, y_train)
#Predict
result = regB.predict(X_test)

#print('Mean squared error: %.2f' % mean_squared_error(result, y_test))

#print(sys.argv[1])
predictedPointDf = gpd.GeoDataFrame()


print(regB.predict([[float(sys.argv[2]),float(sys.argv[1])]]))

sys.stdout.flush()
