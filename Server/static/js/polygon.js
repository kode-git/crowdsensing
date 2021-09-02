// library of functions for polygon making on the geoJSON coordinates ordering

function squaredPolar(point, centre) {
    return [
        Math.atan2(point[1]-centre[1], point[0]-centre[0]),
        (point[0]-centre[0])**2 + (point[1]-centre[1])**2 // Square of distance
    ];
}

// Main algorithm:
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


module.exports = {
    polySort,
    squaredPolar,
}