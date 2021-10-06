// library of functions for polygon making on the geoJSON coordinates ordering

/**
 * squaredPolar(point, centre) determinate the polarization algorithm on the polygon point respect the centre
 * @param point is one of the endpoint
 * @param centre is the centre of the polygon and second endpoint
 * @returns {(number|number)[]} the squared distance between point and centre
 */
function squaredPolar(point, centre) {
    return [
        Math.atan2(point[1]-centre[1], point[0]-centre[0]),
        (point[0]-centre[0])**2 + (point[1]-centre[1])**2 // Square of distance
    ];
}

/**
 * polySort(locations) get the centre of mass of locations and sort them based on the squaredPolar distance
 * @param locations is the list of positions to determinate the squaredPolar and sort them
 * @returns {*} is the sorted list based on the squaredPolar distance differences
 */
function polySort(locations) {
    // Get "centre of mass"
    let centre = [locations.reduce((sum, p) => sum + p[0], 0) / locations.length,
        locations.reduce((sum, p) => sum + p[1], 0) / locations.length];

    // Sort by polar angle and distance, centered at this centre of mass.
    for (let point of locations)
        point.push(...squaredPolar(point, centre));
    locations.sort((a,b) => a[2] - b[2] || a[3] - b[3]);
    // Throw away the temporary polar coordinates
    for (let point of locations) point.length -= 2;
    return locations
}

// module exports
module.exports = {
    polySort,
    squaredPolar,
}