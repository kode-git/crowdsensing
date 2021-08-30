
// functions used for the k-means clustering classification on a dataset of points
// k-means is adopted on db values of points and centroids are taken from random points on the dataset

const MAX_ITERATIONS = 30;

// Getting the random value between min and max
function random(min, max) {
    return Math.floor(
        Math.random() * (max - min) + min
    );
}

// Calculate Squared Euclidean Distance
// sqrt((p1 - q1)^2 + (p2 - q2)^2)
function getSquaredED(x1, y1,x2,y2) {
    return Math.sqrt( Math.pow((x1-x2), 2) + Math.pow((y1-y2), 2) );
}

// Selection of classic randomize algorithm for centroids selection from the dataset
const getRandomCentroids = (dataset, k) => {
    // selects random points as centroids from the dataset
    const numSamples = dataset.length;
    const centroidsIndex = [];
    let index;
    while (centroidsIndex.length < k) {
        index = random(0, numSamples);
        if (centroidsIndex.indexOf(index) === -1) {
            centroidsIndex.push(index);
        }
    }
    const centroids = [];
    for (let i = 0; i < centroidsIndex.length; i++) {
        const centroid = dataset.locations[centroidsIndex[i]];
        centroids.push(centroid);
    }
    return centroids; // list of points
}

const getClusters = (dataset) => {
    // prepare clusters
    const clusters = []
    for(let c = 0; c < dataset.centroids.length; c++){
        // for each cluster
        clusters.push({
            "cluster_id" : c,
            "locations" : [],
            "centroid" : dataset.centroids[c],
        });
    }
    // we consider in the locations assignments the centroids too because
    // the nearest centroid for a centroid is itself
    let closest, closestIndex, previous;
    for(let i = 0; i < dataset.locations.length; i++){
        const point = dataset.locations[i] // taking the ith location point

        for(let j = 0; j < dataset.centroids.length; j++){
            // evaluate distance between centroids and the previous assigned
            // about the first iteration there are not changing
            if(j == 0){
                previous = getSquaredED(point.st_x, point.st_y, dataset.centroids[j].st_x, dataset.centroids[j].st_y)
                closest = dataset.centroids[0]
                closestIndex = 0
            }
            const distance = getSquaredED(point.st_x, point.st_y, dataset.centroids[j].st_x, dataset.centroids[j].st_y)
            // distance between the current point and the jth centroid of the dataset
            if(distance < previous){
                // need to update the point assignment to the jth centroid
                previous = distance
                closest = dataset.centroids[j]
                closestIndex = j
            }
        }
        // here we have the closest centroids assigned to the current point
        // adding it to the label
        // console.log('Put in ' + closestIndex + ' the value ' + JSON.stringify(clusters[closestIndex]) + "\n\n\n")
        clusters[closestIndex].locations.push(point)
    }

    return clusters
}

// recalculation the centroids of the dataset
// given the dataset, return the new collection of centroid
const recalculateCentroids = (dataset) => {
    /*
        we recalculate the cluster’s centroid.
        We do this by calculating the group mean.
        This will shift the centroid to the center of the cluster
    */
    let centroid;
    const centroidList = [];

    for (let k = 0; k < dataset.clusters.length; k++) {
        const cluster = dataset.clusters[k]
        if (cluster.locations.length > 0) {
            // find mean:
            centroid = getPointsMean(cluster);
        } else {
            // get new random centroid, k = 1
            centroid = getRandomCentroids(dataset, 1)[0]; // taking a new random centroid
        }
        dataset.clusters[k].centroid = centroid // update the centroid
        centroidList.push(centroid);
    }
    dataset.centroids = centroidList
    return centroidList;
}

// Given a cluster, return the converge mean point as the new centroid
const getPointsMean = (cluster) => {
    // Taking locations
    locations = cluster.locations
    length = locations.length
    centroid = cluster.centroid
    sum = 0
    for(let i = 0; i < length; i++){
        sum = sum + locations[i].db
    }
    mean = sum / length
    for(let i = 0; i < length; i++){
        current = locations[i]
        if((current.db - mean) < (centroid.db - mean)){
            centroid = current
        }
    }

    return centroid // new centroid
}

const apply = (dataset, k) => {
    dataset.centroids = getRandomCentroids(dataset, k) // insert the initial set of centroids
    dataset.clusters = getClusters(dataset) // insert the initial clusters
    dataset.centroids = recalculateCentroids(dataset) // update clusters and centroids based on k-mean algorithm
    return dataset
}

module.exports = {
    getRandomCentroids,
    getClusters,
    recalculateCentroids,
    apply,
}