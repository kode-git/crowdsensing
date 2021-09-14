import geopandas as gpd
import sqlalchemy as db
import pandas as pd
# Create a database connection
engine = db.create_engine("postgresql://postgres:blockchain@localhost:5432/csdb")
con = engine.connect()
# Read PostGIS database with Geopandas.
sql = "select id, db, ST_X(coordinates), ST_Y(coordinates) from loc_ref_points;"
data = gpd.read_postgis(sql=sql, con=con)