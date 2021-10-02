var map = L.map('map',{zoomSnap: 0.25,
    zoomDelta: 0.5,}).setView([44.494960715733576, 11.344000549862148], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

$(".leaflet-control-zoom").css("visibility", "hidden");
$('.cd-filter-block h4').toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
$("#colorizeMarker").removeClass().removeAttr('style');



/*$('#markerFilter').toggleClass('closed').siblings('#markerSetting').slideToggle(300);
$('#clusterFilter').toggleClass('closed').siblings('#clusterSetting').slideToggle(300);
$('#heatmapFilter').toggleClass('closed').siblings('#heatmapSetting').slideToggle(300);*/
console.log($('#markerFilter'));
console.log($('#clusterFilter'));
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
const spatialnoiselayer = new L.layerGroup();
vertexLayers = [];
heatmapLayers = [];
var heatMap = 0;

// Marker Button
$("#marker").on("click", e => {
    e.preventDefault();
    showMarkers();
    
});

	//close filter dropdown inside lateral .cd-filter 
	$('.cd-filter-block h4').on('click', function(){
        
        switch (true) {
            //------------------------ SHOW MARKER ----------------------------------------------------------------------------
            case ($(this).attr('id')=='markerFilter') ://    
            if( $(this).hasClass('closed')==false){
            markerlayer.clearLayers();
            heatmaplayer.clearLayers();
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            centroidlayer.clearLayers();
            } else{
                showMarkers();
            }
            $(this).toggleClass('closed').siblings('#markerSetting').slideToggle(300);
            if( $('#clusterFilter').hasClass('closed')==false){
                $('#clusterFilter').toggleClass('closed').siblings('#clusterSetting').slideToggle(300);
            } 
            if( $('#heatmapFilter').hasClass('closed')==false){
                $('#heatmapFilter').toggleClass('closed').siblings('#heatmapSetting').slideToggle(300);
            } 
              break;
            // ---------------------- CLUSTERING ------------------------------------------------------------------------ 
            case ($(this).attr('id')=='clusterFilter') ://TTF
            if( $(this).hasClass('closed')==false){
                markerlayer.clearLayers();
                heatmaplayer.clearLayers();
                clusterlayer.clearLayers();
                vertexlayer.clearLayers();
                centroidlayer.clearLayers();
                } else{
                  showClusters(map.getZoom());
                }
            $(this).toggleClass('closed').siblings('#clusterSetting').slideToggle(300);
            if( $('#markerFilter').hasClass('closed')==false){
                $('#markerFilter').toggleClass('closed').siblings('#markerSetting').slideToggle(300);
            } 
            if( $('#heatmapFilter').hasClass('closed')==false){
                $('#heatmapFilter').toggleClass('closed').siblings('#heatmapSetting').slideToggle(300);
            } 
              break;

            //------------------------ HEATMAP -------------------------------------------------------------------------
              case ($(this).attr('id')=='heatmapFilter') ://TTF
              if( $(this).hasClass('closed')==false){
                markerlayer.clearLayers();
                heatmaplayer.clearLayers();
                clusterlayer.clearLayers();
                vertexlayer.clearLayers();
                centroidlayer.clearLayers();
                } else{
                  showHeatmap();
                }
              $(this).toggleClass('closed').siblings('#heatmapSetting').slideToggle(300);
              if( $('#markerFilter').hasClass('closed')==false){
                $('#markerFilter').toggleClass('closed').siblings('#markerSetting').slideToggle(300);
                } 
                if( $('#clusterFilter').hasClass('closed')==false){
                    $('#clusterFilter').toggleClass('closed').siblings('#clusterSetting').slideToggle(300);
                } 
              break;
             default:
           }
	})

  
    function showMarkers() {
    $.ajax({
        url: "/getLocations",
        type: "POST",
        dataType: "json",
        
        success: function (data) {
            //$('#clusterDiv *').prop('disabled', true);
            //$('#heatmapDiv *').prop('disabled', true);
            //$('#markerDiv *').prop('disabled', false);          
           
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
                    layer.bindPopup('<p>DB: ' + feature.properties.db + '\n QoS: '+feature.properties.qos +'\n Privacy: '+ feature.properties.privacy +'</p>');
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



// Heatmap 
function showHeatmap() {
    $.ajax({
        url: "/getLocations",
        type: "POST",
        dataType: "json",
        
        success: function (data) {

            var mapZoom= map.getZoom();
            var geoData = geoJson2heat(data, 1);
            heatMap = new L.heatLayer(geoData, {max: 1});
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            markerlayer.clearLayers();
            centroidlayer.clearLayers();
            heatmaplayer.clearLayers();
             if(mapZoom==12){
                heatMap =  {max: 3};
            }else if(mapZoom==13){
                 heatMap = new L.heatLayer(geoData, {max: 2});
            }else if(mapZoom==15){
                 heatMap = new L.heatLayer(geoData, {max: 7});
            }
        


            heatmaplayer.addLayer(heatMap);
            
            map.addLayer(heatmaplayer);

        }
        
    });
};


//Bugfixed heatmap while zooming
map.on('zoomend', function() {
   var mapZoom= map.getZoom();
   console.log(mapZoom)
   if( $('#heatmapFilter').hasClass('closed')==false){
   showHeatmap();
   }  
});



//Spatial noise clustering
/*
function showSpatialNoiseCluster(num) {
    $.ajax({
        url: "/showClustersOnDb",
        type: "POST",
        dataType: "json",
        data: {
            k: num
        },
        success: function (data) {
            console.log("SPATIALNOISE");
            var listColor=getColorArray();
            //$('#clusterDiv *').prop('disabled', true);
            //$('#heatmapDiv *').prop('disabled', true);
            //$('#markerDiv *').prop('disabled', false);          
           console.log(listColor[1]);
            marker = L.geoJson(data, {
                pointToLayer: function (feature, latlng) {
                        var geojsonColorizeOptions={
                            radius: 6,
                            fillColor: listColor[ feature.properties.cluster],
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                    }
                    return L.circleMarker(latlng, geojsonColorizeOptions);
                }, onEachFeature: function (feature, layer) {
                    layer.bindPopup('<p>DB: ' + feature.properties.db + '\n QoS: '+feature.properties.qos +'\n Cluster: '+ feature.properties.cluster +'</p>');
                }
            });

            markerlayer.clearLayers();
            heatmaplayer.clearLayers();
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            centroidlayer.clearLayers();
            spatialnoiselayer.clearLayers();
            spatialnoiselayer.addLayer(marker);
            map.addLayer(spatialnoiselayer);
        }
    });
};*/

function showSpatialNoiseCluster(num) {
    $.ajax({
        type: 'POST',
        url: '/showClustersOnDb',
        dataType: 'json',
        data: {
            k: parseInt(num)
        },
        
        success: function (data) {
            
            console.log("SPATIALNOISE");
        }
    })
}




//Clustering function
function showClusters(mapZoom) {
    $.ajax({
        type: 'POST',
        url: '/showClusters',
        dataType: 'json',
        data: {
            k: parseInt(mapZoom)
        },
        
        success: function (data) {
           /*$('#clusterDiv *').prop('disabled', false);
            $('#heatmapDiv *').prop('disabled', true);
            $('#markerDiv *').prop('disabled', true);*/
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            markerlayer.clearLayers();
            centroidlayer.clearLayers();
            heatmaplayer.clearLayers();
            
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


            //document.getElementById("cluster").value=kmeans;
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
    var max=80;
    if (value > max) value = max;
    var v = (value-min) / (max-min);
    var hue=((1 - v)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

function getColorDarker(value){
    var min=20;
    var max=80;
    if (value > max) value = max;
    var v = (value-min) / (max-min);
    var hue=((1 - v)*120).toString(10);
    return ["hsl(",hue,",100%,40%)"].join("");
}

function getColorHover(value){
    var min=20;
    var max=80;
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

$('#colorizeMarker').change(function () {
    showMarkers();

});

$('#clusterOption').on('change', function (e) {
    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;
    
    if(valueSelected=='spatial'){
        showClusters();
        console.log(" normale");
    }  else if(valueSelected=='spatialnoise'){
        console.log(" spatial-noise");
        showSpatialNoiseCluster();
    }
});
/*
$('#mrk').change(function () {
    showCluster();
});
$('#plg').change(function () {
    showClusters();
});
$('#cnt').change(function () {
    showCluster();
});
*/

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
    console.log(this.value);
    $("#kmeansLabel").empty();
    $("#kmeansLabel").append("(", this.value,")");
    showClusters(this.value);
    
}

  
function getColorArray() {
    console.log($('#cluster').value);
    var colorArray=[];
    for (var i = 0; i < 10; i++) {
        var letters = '0123456789ABCDEF';
    var color = '#';
        for (var j = 0; j < 6; j++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
    colorArray.push(color);
    }
    console.log(colorArray);
    return colorArray;
  }


  




/*
$('#clusterCheckbox').change(function () {
    console.log(this);
});*/

// Checkbox trigger for cluster settings (markers,polygons,centroids)
function checkboxCluster(checkboxElem) {
    console.log("AAAAAAAa");
    if (checkboxElem.checked ) {
        console.log(checkboxElem.name)
        map.addLayer(eval(checkboxElem.name));
    } else{
        
        console.log(checkboxElem.name)
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

//prediction test
function onMapClick(e) {
    

    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [e.latlng.lng, e.latlng.lat] // inverted respect postGIS data

        }

    }
    

    $.ajax({
        url: "/prd",
        type: "POST",
        dataType: "json",
        data: {
            myPoint: feature
        },
        
        success: function (data) {
           console.log(data);
            
        
    showClusters(map.getZoom());
        }
        
    });



}

map.on('dblclick', onMapClick);

$("#clusters").on("click", e => {
    e.preventDefault();
});

