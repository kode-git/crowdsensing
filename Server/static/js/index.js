
var map = L.map('map',{zoomSnap: 0.25,
    zoomDelta: 0.5,}).setView([44.494960715733576, 11.344000549862148], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

/*

// This is for auto-location on map view entering
map.locate({setView: true, minZoom: 5});
var latitudine;
var longitudine;

function onLocationFound(e) {
    latitudine = e.latitude;
    longitudine = e.longitude;
    console.log(e.latitude + ' .... ' + e.longitude);
}


map.on('locationfound', onLocationFound);
 */

let marker;
let heat;
const heatmaplayer = new L.layerGroup();
const markerlayer = new L.layerGroup();
markerLayers = [];
const clusterlayer = new L.layerGroup();
clusterLayers = [];
const vertexlayer = new L.layerGroup();
const centroidlayer = new L.layerGroup();
vertexLayers = [];
heatmapLayers = [];
var heatMap = 0;

// Marker Button

$("#marker").on("click", e => {
    e.preventDefault();
    showMarkers();
});

    function showMarkers() {

    $.ajax({
        url: "/getLocations",
        type: "POST",
        dataType: "json",
        
        success: function (data) {
            $('#clusterDiv *').prop('disabled', true);
            $('#heatmapDiv *').prop('disabled', true);
            $('#markerDiv *').prop('disabled', false);          
           
            marker = L.geoJson(data, {
                pointToLayer: function (feature, latlng) {
                    if(document.getElementById("colorizeMarker").checked==false){
                        var geojsonColorizeOptions = {
                            radius: 6,
                            fillColor: "#0f8bff",
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        };
                        }else{
                        var geojsonColorizeOptions={
                            radius: 6,
                            fillColor: getColor(feature.properties.db),
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        };
                    }
                    return L.circleMarker(latlng, geojsonColorizeOptions);
                }, onEachFeature: function (feature, layer) {
                    layer.bindPopup('<p>DB: ' + feature.properties.db + '\n </p>');
                }
                
            });
            
            markerlayer.clearLayers();
            heatmaplayer.clearLayers();
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            centroidlayer.clearLayers();
            markerlayer.addLayer(marker);
            map.addLayer(markerlayer);
        }
    });
};


// Heatmap Button

$("#heatmap").on("click", e => {
    e.preventDefault();
    $.ajax({
        url: "/getLocations",
        type: "POST",
        dataType: "json",
        
        success: function (data) {
            $('#clusterDiv *').prop('disabled', true);
            $('#heatmapDiv *').prop('disabled', false);
            $('#markerDiv *').prop('disabled', true);
            var geoData = geoJson2heat(data, 1);
            heatMap = new L.heatLayer(geoData, {max: 1});
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            markerlayer.clearLayers();
            centroidlayer.clearLayers();
            heatmaplayer.clearLayers();
            
            heatmaplayer.addLayer(heatMap);
            
            map.addLayer(heatmaplayer);
        }
        
    });
});

// Clusters Button
/*
map.on('zoomend', function() {
showClusters(map.getZoom());
});
*/
$("#clusters").on("click", e => {
    e.preventDefault();
    showClusters(map.getZoom());
});

function showClusters(mapZoom) {
    $.ajax({
        type: 'POST',
        url: '/showClusters',
        dataType: 'json',
        data: {
            k: parseInt(mapZoom)
        },
        
        success: function (data) {
            $('#clusterDiv *').prop('disabled', false);
            $('#heatmapDiv *').prop('disabled', true);
            $('#markerDiv *').prop('disabled', true);
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            markerlayer.clearLayers();
            centroidlayer.clearLayers();
            heatmaplayer.clearLayers();
            
            console.log(data);
            kmeans = parseInt(mapZoom)
            for (let i = 0; i < kmeans; i++) {
                
                //console.log(getColor(data.centroids[i].properties.db));
                var geojsonPolygonOptions = {
                    fillColor: getColor(data.clusters[i].properties.db),
                    weight: 4,
                    opacity: 1,
                    color: getColorDarker(data.clusters[i].properties.db),
                    fillOpacity: 0.5,
                    smoothFactor: 3
                    
                };
                
                var geojsonMarkerOptions = {
                    fillColor: getColor(data.clusters[i].properties.db),
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };
                // Polygons geometry views
                var polygon = L.polygon(data.clusters[i].geometry.coordinates, geojsonPolygonOptions).bindPopup('<h1>' + data.centroids[i].properties.db + 'db </h1> <p> ' + data.clusters[i].geometry.coordinates.length + ' points belongs to this cluster </p>');
                polygon.on('mouseover', function () {
                    this.setStyle({
                        'fillColor': getColorHover(data.clusters[i].properties.db),
                    })
                });
                polygon.on('mouseout', function () {
                    this.setStyle({
                        'fillColor': getColor(data.clusters[i].properties.db)
                    });
                });
                // Centroids geometry view
                var lat = data.centroids[i].geometry.coordinates[0];
                var lng = data.centroids[i].geometry.coordinates[1];
                var latlng = new L.latLng(lat, lng);
                
                var centroid = L.circleMarker(latlng, geojsonMarkerOptions).bindPopup('<h1>' + data.clusters[i].properties.db + 'db </h1>');
                
                //Both layers from centroids and cluster geometries
                clusterlayer.addLayer(polygon); //
                centroidlayer.addLayer(centroid); //
                
                for (let j = 0; j < data.locations.length; j++) {    
                    var lat = data.locations[j].geometry.coordinates[0];
                    var lng = data.locations[j].geometry.coordinates[1];
                    var latlng = new L.latLng(lat, lng);
                    var geojsonVertexOptions = {
                        radius: 3,
                        fillColor: getColor(data.locations[j].properties.db),
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    };
                    
                    
                    var vertex = L.circleMarker(latlng, geojsonVertexOptions).bindPopup('<h1>' + data.locations[j].properties.db + 'db </h1>');
                    ;
                    vertexlayer.addLayer(vertex);
                    
                }
            }


            document.getElementById("cluster").value=kmeans;
            var cls=document.getElementById("plg").checked;
            var vtx=document.getElementById("mrk").checked;
            var cnt=document.getElementById("cnt").checked;
        
            switch (true) {
                case (cls === true && vtx === true && cnt === true) ://TTT
                    map.addLayer(clusterlayer);
                    map.addLayer(centroidlayer);
                    map.addLayer(vertexlayer);        
                  break;
                case (cls === true && vtx === true && cnt === false) ://TTF
                    map.addLayer(clusterlayer);
                    map.addLayer(vertexlayer);
                  break;
                case (cls === true && vtx === false && cnt === true) ://TFT
                    map.addLayer(clusterlayer);
                    map.addLayer(centroidlayer);
                  break;
                case (cls === false && vtx === true && cnt === true) ://FTT
                    map.addLayer(centroidlayer);
                    map.addLayer(vertexlayer);
                  break;
                case (cls === true && vtx === false && cnt === false) ://TFF
                    map.addLayer(clusterlayer);
                  break;
                case (cls === false && vtx === true && cnt === false) ://FTF
                  map.addLayer(vertexlayer);
                  break;
                case (cls === false && vtx === false && cnt === true) ://FFT
                  map.addLayer(centroidlayer);
                break;    
                 default:
               }



            
        }
    })
}


// Convert DB in a color shade from green to red
function getColor(value){
    var min=20;
    var max=43;
    if (value > max) value = max;
    var v = (value-min) / (max-min);
    var hue=((1 - v)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

function getColorDarker(value){
    var min=20;
    var max=43;
    if (value > max) value = max;
    var v = (value-min) / (max-min);
    var hue=((1 - v)*120).toString(10);
    return ["hsl(",hue,",100%,40%)"].join("");
}

function getColorHover(value){
    var min=20;
    var max=43;
    if (value > max) value = max;
    var v = (value-min) / (max-min);
    var hue=((1 - v)*120).toString(10);
    return ["hsl(",hue,",100%,30%)"].join("");
}


//Heatmap geoJSON formatting
geoJson2heat = function (geojson) {
    return geojson.features.map(function (feature) {
        return [parseFloat(feature.geometry.coordinates[1]), parseFloat(feature.geometry.coordinates[0]), feature.properties.db];
    });
}


//Slider for blur heatmap
var blurSlider = document.getElementById("blur");

blurSlider.oninput = function () {
    console.log(blurSlider);
    heatMap.setOptions({
        blur: parseInt(this.value)
    });
    // render the new options
    heatMap.redraw();
}

//Slider for radius of heatmap
var radiusSlider = document.getElementById("radius");
radiusSlider.oninput = function () {
    heatMap.setOptions({
        radius: parseInt(this.value)
    });
    // render the new options
    heatMap.redraw();
}

// Slider for k setting for k-means clustering
var clusterSlider = document.getElementById("cluster");
clusterSlider.oninput = function () {
    showClusters(this.value);
}


// Checkbox trigger for cluster settings (markers,polygons,centroids)
function checkboxCluster(checkboxElem) {
    if (checkboxElem.checked ) {
        map.addLayer(eval(checkboxElem.name));
    } else{
        map.removeLayer(eval(checkboxElem.name));
    }
}    
       
function colorizeMarker(checkboxElem) {
        showMarkers();
}

// Temporal Radio Buttons
$('input[type="radio"]').on('click', function () {
    var value = $(this).val();
    
    var name = $(this).attr('value');
    if (value == 'mapnik') {
        L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
    } else if (value == 'thunder') {
        var Thunderforest_Transport = L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey={apikey}', {
            attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            apikey: '4d975f2a48924ef0beda223fc08d16ef',
            maxZoom: 22
        }).addTo(map);
    } else if (value == 'stadia') {
        var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            r: 'f7bbae07-5f38-4731-92c2-3f977975be0a',
            attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        }).addTo(map);
        
    }
});

//


