// this is a package of functions used for data manipulation

// given result as a set of loc_ref_points rows, returns data in geoJSON format
const convertLocations = (results) => {
    geoJSON = {
        "type" : "FeatureCollection",
        "features" : []
    }
    const rLength = results.rows.length
    for(let i = 0; i < rLength; i++){
        row = results.rows[i] //
        feature = {
            "type" : "Feature",
            "properties" : {
                "id" : row.id,
                "db" : row.db,
                "neighbour" : row.neighbour,
                "range" : row.range
            },
            "geometry" : {
                "type" : "Point",
<<<<<<< HEAD
                "coordinates" : [row.st_x, row.st_y] // inverted respect postGIS data
                }
=======
                "coordinates" : [ row.st_y,row.st_x] // inverted respect postGIS data
>>>>>>> ed51c35418582c584e10791ae63ea2e1a18b2a38
            }

        geoJSON.features.push(feature)
    }

    return geoJSON
}

/*
{"length":10,"locations":
    [{"neighbour":5,"range":3000,"db":35.6,"st_x":44.494606081093835,"st_y":11.342310933141105},
    {"neighbour":5,"range":3000,"db":45.6,"st_x":44.49382696564242,"st_y":11.340955053334865},
    {"neighbour":5,"range":3000,"db":40.6,"st_x":44.49831345337963,"st_y":11.345286336049236},
    {"neighbour":5,"range":3000,"db":28.9,"st_x":44.48880276431684,"st_y":11.346227919248012},
    {"neighbour":5,"range":3000,"db":37.1,"st_x":44.500489409942844,"st_y":11.341218696630524},
    {"neighbour":5,"range":3000,"db":35.8,"st_x":44.49001183626599,"st_y":11.336586107292545},
    {"neighbour":5,"range":3000,"db":22.8,"st_x":44.500946081874375,"st_y":11.339071886937313},
    {"neighbour":5,"range":3000,"db":29,"st_x":44.48928639610413,"st_y":11.337339373851567},
    {"neighbour":5,"range":3000,"db":49,"st_x":44.496143586417716,"st_y":11.350625283118877},
    {"neighbour":5,"range":3000,"db":47.3,"st_x":44.49781995931815,"st_y":11.356171600693344}],
    "centroids":
        [{"neighbour":5,"range":3000,"db":22.8,"st_x":44.500946081874375,"st_y":11.339071886937313},
        {"neighbour":5,"range":3000,"db":28.9,"st_x":44.48880276431684,"st_y":11.346227919248012},
        {"neighbour":5,"range":3000,"db":35.6,"st_x":44.494606081093835,"st_y":11.342310933141105}],
    "clusters":
        [{"cluster_id":0,
          "mean_db": ...
          "locations":
                [{"neighbour":5,"range":3000,"db":35.8,"st_x":44.49001183626599,"st_y":11.336586107292545},
                {"neighbour":5,"range":3000,"db":22.8,"st_x":44.500946081874375,"st_y":11.339071886937313},
                {"neighbour":5,"range":3000,"db":29,"st_x":44.48928639610413,"st_y":11.337339373851567}],
          "centroid":{"neighbour":5,"range":3000,"db":22.8,"st_x":44.500946081874375,"st_y":11.339071886937313}},
         {"cluster_id":1,
          "mean_db": ...
          "locations":
                 [{"neighbour":5,"range":3000,"db":28.9,"st_x":44.48880276431684,"st_y":11.346227919248012},
                  {"neighbour":5,"range":3000,"db":49,"st_x":44.496143586417716,"st_y":11.350625283118877},
                  {"neighbour":5,"range":3000,"db":47.3,"st_x":44.49781995931815,"st_y":11.356171600693344}],
           "centroid":{"neighbour":5,"range":3000,"db":28.9,"st_x":44.48880276431684,"st_y":11.346227919248012}},
         {"cluster_id":2,
          "locations":
            [{"neighbour":5,"range":3000,"db":35.6,"st_x":44.494606081093835,"st_y":11.342310933141105},
             {"neighbour":5,"range":3000,"db":45.6,"st_x":44.49382696564242,"st_y":11.340955053334865},
             {"neighbour":5,"range":3000,"db":40.6,"st_x":44.49831345337963,"st_y":11.345286336049236},
             {"neighbour":5,"range":3000,"db":37.1,"st_x":44.500489409942844,"st_y":11.341218696630524}],
         "centroid":{"neighbour":5,"range":3000,"db":35.6,"st_x":44.494606081093835,"st_y":11.342310933141105}}]}

geoJSON = {
       "type" : "ClusterCollection",
       "locations" : [
        {
            "type" : "Feature",
            "properties" : {
                "id" : row.id,
                "db" : row.db,
                "neighbour" : row.neighbour,
                "range" : row.range
                "cluster_id" : cluster_id
            },
            "geometry" : {
                "type" : "Point",
                "coordinates" : [row.st_x, row.st_y] // inverted respect postGIS data
                }
          }
       ],
       "centroids" : [
                {
            "type" : "Feature",
            "properties" : {
                "id" : row.id,
                "db" : row.db,
                "neighbour" : row.neighbour,
                "range" : row.range
                "cluster" : cluster.id
            },
            "geometry" : {
                "type" : "Point",
                "coordinates" : [row.st_x, row.st_y] // inverted respect postGIS data
                }
            }
        ]
        "clusters" : [
            {
            "type" : "Feature",
            "properties" : {
                "cluster_id" : row.id,
                "db_mean" : row.db,
            },
            "geometry" : {
                "type" : "Polygon",
                "coordinates" : [[loc1.st_x, loc1.st_y], [loc2.st_x, loc2.st_y], [loc3.st_x, loc3.st_y]] // inverted respect postGIS data
                }
            }
        ]

 */
// convert clusters dataset into a geoJSON data format
// it's similar to the locations but there are like centroids
// and clusters as added attributes in circle geometry format
const convertClusters = (results, dataset) => {
    geoJSON = {
        "type" : "ClustersCollection",
        "locations" : [],
        "centroids" : [],
        "clusters" : []
    }

    // adding locations features as geometry points for geoJSON view
    const rLength = results.rows.length
    const clustsLength = dataset.clusters.length
    for(let i = 0; i < rLength; i++){
        // loop of rows
        cluster_id = 0
        row = results.rows[i] //
        for(let j = 0; j < clustLength; j++){
            // loop on clusters
            let locations = dataset.cluster[j].locations
            let locLength = locations.length
            for(let l = 0; l < locLength; l++ ){
                // loop of locations of cluster j
                if(locations[l].st_x == row.st_x && locations[l].st_y == row.st_y){
                    cluster_id = dataset.cluster[j].cluster_id
                }
            }
        }
        feature = {
            "type" : "Feature",
            "properties" : {
                "id" : row.id,
                "db" : row.db,
                "neighbour" : row.neighbour,
                "range" : row.range
                "cluster_id" :
            },
            "geometry" : {
                "type" : "Point",
                "coordinates" : [row.st_x, row.st_y] // inverted respect postGIS data
            }
        }

        geoJSON.features.push(feature)
    }

    // adding centroids features as geometry colored points


}

// populate DB with dummy points in Bologna area
// range are 0 and 3000 with step 1
// DBs are between 20 to 50
const populateDB = (pool, n) => {

}

module.exports = {
    convertLocations,
    convertClusters,
    populateDB,
}