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
sql = "select id,coordinates,db from loc_ref_points as l1 where ST_Distance(ST_SetSRID(l1.coordinates,  4326)::geography , ST_GeomFromText('POINT({} {})', 4326)::geography)<=500;".format(float(sys.argv[2]),float(sys.argv[1]))



data = gpd.read_postgis(sql=sql, con=con, geom_col="coordinates")
flag=False

logger.error(len(data))
#requering if the number of points are less than ten
if(len(data)<3):
    logger.error("less than three points")
    #if the flag is false there are less than ten point for the query result
    flag=True
    sql = "select id,coordinates,db from loc_ref_points;"
    data = gpd.read_postgis(sql=sql, con=con, geom_col="coordinates")
    logger.error(len(data))


#creating the pandas dataframe
train_data = gpd.GeoDataFrame()
train_data['lat'] = data["coordinates"].x
train_data['lng'] = data["coordinates"].y




train_result = data['db']

#training phase, when we have more than 10 elements near ourpoint, we use the knn regressor
if flag:
    #splitting the dataset in train and test sets
    X_train, X_test, y_train, y_test = train_test_split( train_data, train_result, test_size=0.20, random_state=42, shuffle=True )

    #fitting phase
    regB = MLPRegressor(random_state=1, max_iter=5000).fit(X_train, y_train)

    #mean squared error evaluation for the regressor
    # regL= LinearRegression().fit(X_train, y_train)
    MSEB= mean_squared_error(regB.predict(X_test), y_test)
    # MSEL= mean_squared_error(regL.predict(X_test), y_test)
    logger.error( MSEB)
    # logger.error( MSEL)
else:
    knn = neighbors.KNeighborsRegressor(3)
    #fitting phase of the knn regressor
    knn.fit(train_data, train_result)



#Predict and setting up a JSON for the client 
if not(flag):
    outLine='\"db\":{}'.format(knn.predict([[float(sys.argv[2]),float(sys.argv[1])]])[0] )
else:
    outLine='\"db\":{}'.format(regB.predict([[float(sys.argv[2]),float(sys.argv[1])]])[0] )

outLine="{" + outLine + "}"

print(outLine)

sys.stdout.flush()
