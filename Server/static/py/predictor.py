import geopandas as gpd
import sqlalchemy as db
from sklearn.model_selection import train_test_split
import sys
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.neural_network import MLPRegressor
from sklearn import neighbors
import logging

#logger for external console log
logger = logging.getLogger()
logger.propogate = True

# Create a database connection
engine = db.create_engine(
    "postgresql://postgres:blockchain@localhost:5432/csdb")
con = engine.connect()
# Read PostGIS database with Geopandas.
sql = "select id,coordinates,db from loc_ref_points as l1 where ST_Distance(ST_SetSRID(l1.coordinates,  4326)::geography , ST_GeomFromText('POINT({} {})', 4326)::geography)<=10000;".format(float(sys.argv[2]),float(sys.argv[1]))



data = gpd.read_postgis(sql=sql, con=con, geom_col="coordinates")

flag=False



if(len(data)<10):
    logger.error("less than ten points")
    #if the flag is false there are less than ten point for the query result
    flag=True
    sql = "select id,coordinates,db from loc_ref_points;"
    data = gpd.read_postgis(sql=sql, con=con, geom_col="coordinates")
logger.error(len(data))

train_data = gpd.GeoDataFrame()

train_data['lat'] = data["coordinates"].x
train_data['lng'] = data["coordinates"].y
myMinLat=train_data['lat'].min()
myMaxLat=train_data['lat'].max()
myMinLng=train_data['lng'].min()
myMaxLng=train_data['lng'].max()

def min_max_scaling(df):
    # copy the dataframe
    df_norm = df.copy()
    # apply min-max scaling
    for column in df_norm.columns:
        df_norm[column] = (df_norm[column] - df_norm[column].min()) / (df_norm[column].max() - df_norm[column].min())
        
    return df_norm


if flag:
    train_dataMLP= min_max_scaling(train_data)
myLat=(float(sys.argv[2]) - myMinLat) / (myMaxLat - myMinLat)
myLng=(float(sys.argv[1]) - myMinLng) / (myMaxLng - myMinLng)

train_result = data['db']

#training phase, when we have more than 10 elements near ourpoint, we use the knn regressor
if flag:
    regB = MLPRegressor(random_state=1, max_iter=5000).fit(train_dataMLP, train_result)
else:
    knn = neighbors.KNeighborsRegressor(3)
    knn.fit(train_data, train_result)



#Predict
if not(flag):
    outLine='\"db\":{}'.format(knn.predict([[float(sys.argv[2]),float(sys.argv[1])]])[0] )
else:
    outLine='\"db\":{}'.format(regB.predict([[myLat,myLng]])[0] )

outLine="{" + outLine + "}"

print(outLine)

sys.stdout.flush()
