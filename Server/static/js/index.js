var map = L.map('map',{zoomSnap: 0.25,
    zoomDelta: 0.5,minZoom:5}).setView([44.494960715733576, 11.344000549862148], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


$(".leaflet-control-zoom").css("visibility", "hidden");
$('.cd-filter-block h4').toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
$("#colorizeMarker").removeClass().removeAttr('style');

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

const predictedlayer = new L.layerGroup();
vertexLayers = [];
heatmapLayers = [];
var heatMap = 0;

    //close filter dropdown inside side bar 
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
            spatialnoiselayer.clearLayers();
            
            predictedlayer.clearLayers();
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
            case ($(this).attr('id')=='clusterFilter') :
            if( $(this).hasClass('closed')==false){
                markerlayer.clearLayers();
                heatmaplayer.clearLayers();
                clusterlayer.clearLayers();
                vertexlayer.clearLayers();
                centroidlayer.clearLayers();
                
            spatialnoiselayer.clearLayers();
            predictedlayer.clearLayers();
                } else{
                    if($("#clusterOption").val()=='spatial'){
                        showClusters($("#cluster").val());
                        console.log(" normale");
                    }  else if($("#clusterOption").val()=='spatialnoise'){
                        console.log(" spatial-noise");
                        showSpatialNoiseCluster($("#cluster").val());
                    }
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
                
            spatialnoiselayer.clearLayers();
            
            predictedlayer.clearLayers();
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
//---------------------------MARKER-------------------------------------------------------------
   // Show markers clicking in sidebar showmarkers section
    function showMarkers() {
    $.ajax({
        url: "/getLocations",
        type: "POST",
        dataType: "json",
        
        success: function (data) {        
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
                    var customOptions =
                    {
                    'maxWidth': '400',
                    'width': '200',
                    'className' : 'popupCustom'
                    }
                       var customPopup = '<span>Noise: </span> '+ feature.properties.db+'<br>  <span>QoS: </span> '+ feature.properties.qos+'<br>  <span>Privacy: </span> '+ feature.properties.privacy+'<br>';
                   layer.bindPopup(customPopup,customOptions);
                }
             
            });
            markerlayer.clearLayers();
            predictedlayer.clearLayers();
            heatmaplayer.clearLayers();
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            predictedlayer.clearLayers();
            
            spatialnoiselayer.clearLayers();
            centroidlayer.clearLayers();
            markerlayer.addLayer(marker);
            map.addLayer(markerlayer);
        }
    });
};

//--------------------------- PREDICTED MARKER-------------------------------------------------------------
   // Show predicted marker 
function showPredictedMarker(e) {
    load=1;
    console.log(load);
    if(load==1){
        
        $('#loading').show(); 
    }
            predictedlayer.clearLayers();
            heatmaplayer.clearLayers();
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            predictedlayer.clearLayers();
            
            spatialnoiselayer.clearLayers();
            centroidlayer.clearLayers();
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
           let obj=JSON.parse(JSON.stringify(data));
         
         let str1=obj.replace('{"db','');
         let str2=str1.replace('":','');
         let str3=str2.replace('}','');
         var db=parseInt(str3);
         console.log("DB predicted: "+db)
         load=0;
              
         $('#loading').hide(); 

    if(document.getElementById("colorizeMarker").checked==false){
        var geojsonColorizeOptions = {
            radius: 9,
            fillColor: "#621cb8",
            color: "#000",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8
        };
      }else{
        var geojsonColorizeOptions={
            radius: 9,
            fillColor: getColor(db),
            color: "#000",
            weight: 3,
            opacity: 1,
            fillOpacity: 0.8
        };
        
    }
    var circle = L.circleMarker([e.latlng.lat,e.latlng.lng],geojsonColorizeOptions)
    var customOptions =
    {
    'maxWidth': '400',
    'width': '200',
    'className' : 'popupCustom'
    }
       var customPopup = '<span>Noise: </span> '+ db +'<br>  <span>QoS: </span> <br>  <span>Privacy: </span> <br>';
   circle.bindPopup(customPopup,customOptions);

    predictedlayer.addLayer(circle);
    map.addLayer(predictedlayer);
        }
        
    });

}

//---------------------------ZOOMING ALERT -------------------------------------------------------------
   // Show markers clicking in sidebar showmarkers section
var start;
var end;
var confirmation=false;
map.on("zoomstart", function (e) { start=e.target._zoom;  });
map.on("zoomend", function (e) { 
     end= e.target._zoom;
     if(end==start-2 || end==start+2 || start==end-2 || start==end+2 || end==start-3 || end==start+3 || start==end-3 || start==end+3){
        if(confirmation==false){
         var result =confirm("Use trackpad for a precise zoom!");
        if (result) {
            confirmation=true;
        }
    }
    }

    });

//---------------------------HEATMAP -------------------------------------------------------------
   // Show heatmap
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
            predictedlayer.clearLayers();
            spatialnoiselayer.clearLayers();
          
             if(mapZoom==12){
                 heatMap = new L.heatLayer(geoData, {max: 1.5});
            }else if(mapZoom==13){
                 heatMap = new L.heatLayer(geoData, {max: 2.5});
            }else if(mapZoom==14){
                 heatMap = new L.heatLayer(geoData, {max: 5});
            }else if(mapZoom==15){
                heatMap = new L.heatLayer(geoData, {max: 10});
            }else if(mapZoom==16){
                heatMap = new L.heatLayer(geoData, {max: 20});
            }else if(mapZoom==17){
                heatMap = new L.heatLayer(geoData, {max: 40});
            }else if(mapZoom==18){
                heatMap = new L.heatLayer(geoData, {max: 80});
            }
        
            heatMap.setOptions({
                blur: parseInt($("#blur").val()),
                radius: parseInt($("#radius").val())
            });
            // render the new options

            heatmaplayer.addLayer(heatMap);
            
            map.addLayer(heatmaplayer);

        }
        
    });
};


//Bugfixed heatmap while zooming
map.on('zoomend', function() {
   if( $('#heatmapFilter').hasClass('closed')==false){
   showHeatmap();
   }  
});



//---------------------------SPATIAL NOISE CLUSTERING-------------------------------------------------------------
   // Show spatial noise clustering
//Spatial noise clustering

$('#loading').hide(); 
var load;
var latitudine;
var longitudine;
function showSpatialNoiseCluster(num) {
    spatialnoiselayer.clearLayers();
    load=1;
    console.log(load);
    if(load==1){
        
        $('#loading').show(); 
    }
    
    $('#mrk').prop( "disabled", true );
    $('#cnt').prop( "disabled", true );
    $('#plg').prop( "disabled", true );
    $.ajax({
        url: "/showClustersOnDb",
        type: "POST",
        dataType: "json",
        data: {
            k: num
        },
        success: function (data) {
            load=0;
            
        $('#loading').hide(); 
            
            console.log("SPATIALNOISE");
            var listColor=getColorArray();        
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
                    console.log(latlng);
                    console.log(latlng.lat)
                    latitudine=latlng.lat;
                    longitudine=latlng.lng;
                    return L.circleMarker(latlng, geojsonColorizeOptions);
                    
                }, onEachFeature: function (feature, layer) {
                    
                    console.log(feature.properties);
                    layer.bindPopup('<p>DB: ' + feature.properties.db + '\n QoS: '+feature.properties.qos +'\n Cluster: '+ feature.properties.cluster +'</p>');
                   
                        //console.log(icon2);
                
                }
            });
            markerlayer.clearLayers();
            heatmaplayer.clearLayers();
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            centroidlayer.clearLayers();
            predictedlayer.clearLayers();
            spatialnoiselayer.addLayer(marker);
            
            map.addLayer(spatialnoiselayer);
        }
    });
};

//---------------------------SPARIAL CLUSTERING-------------------------------------------------------------
   // Show clustering clicking in sidebar showclusters section
function showClusters(mapZoom) {
    
            
    $('#mrk').prop( "disabled", false );
    $('#cnt').prop( "disabled", false );
    $('#plg').prop( "disabled", false );
    $.ajax({
        type: 'POST',
        url: '/showClusters',
        dataType: 'json',
        data: {
            k: parseInt(mapZoom)
        },
        
        success: function (data) {
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            markerlayer.clearLayers();
            centroidlayer.clearLayers();
            heatmaplayer.clearLayers();
            spatialnoiselayer.clearLayers();
            predictedlayer.clearLayers();
            
            kmeans = parseInt(mapZoom)
            for (let i = 0; i < kmeans; i++) {
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
               
                var polygon = L.polygon(data.clusters[i].geometry.coordinates, geojsonPolygonOptions).bindPopup('<span>Mean Noise:</span>' +data.clusters[i].properties.db + ' </br> <p> <span> ' + data.clusters[i].geometry.coordinates.length + '</span> points belongs to this cluster </p>');
               

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
                
               
                  var centroid;
                  centroid= L.circleMarker(latlng,geojsonMarkerOptions).bindPopup('<h1>' + data.clusters[i].properties.db + 'db </h1>');
                if(data.clusters[i].geometry.coordinates.length>=10){       
                var icon = L.marker([lat,lng], {
                    icon: L.divIcon({
                        className: 'my-custom-icon',
                        html: data.clusters[i].geometry.coordinates.length
                    })
                });
            }
            else{
                var icon = L.marker([lat,lng], {
                    icon: L.divIcon({
                        className: 'my-custom-icon2',
                        html: data.clusters[i].geometry.coordinates.length
                    })
                });
            }
                console.log(icon);
                centroidlayer.addLayer(icon);


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
                    
                    vertexlayer.addLayer(vertex);
                    
                }
            }


            //document.getElementById("cluster").value=kmeans;
            var cls=document.getElementById("plg").checked;
            var vtx=document.getElementById("mrk").checked;
            var cnt=document.getElementById("cnt").checked;
        
            switch (true) {
                case (cls === true && vtx === true && cnt === true) ://TTT
                    map.addLayer(centroidlayer);
                    map.addLayer(clusterlayer);
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


// Convert DB in a color shade from green to red------------------------------------------------------------------
function getColor(value){
    var min=20;
    var max=80;
    if (value > max) value = max;
    var v = (value-min) / (max-min);
    var hue=((1 - v)*120).toString(10);
    return ["hsl(",hue,",100%,50%)"].join("");
}

// Convert DB in a darker color shade from green to red--------------------------------------------------------------
function getColorDarker(value){
    var min=20;
    var max=80;
    if (value > max) value = max;
    var v = (value-min) / (max-min);
    var hue=((1 - v)*120).toString(10);
    return ["hsl(",hue,",100%,40%)"].join("");
}

// Convert Polygon background in a color shade from green to red-----------------------------------------------------------
function getColorHover(value){
    var min=20;
    var max=80;
    if (value > max) value = max;
    var v = (value-min) / (max-min);
    var hue=((1 - v)*120).toString(10);
    return ["hsl(",hue,",100%,30%)"].join("");
}


//Heatmap geoJSON formatting--------------------------------------------------------------------------------------------------
geoJson2heat = function (geojson) {
    return geojson.features.map(function (feature) {
        return [parseFloat(feature.geometry.coordinates[1]), parseFloat(feature.geometry.coordinates[0]), feature.properties.db];
    });
}

// colorize marker ------------------------------------------------------------------------------------------------------
$('#colorizeMarker').change(function () {
    showMarkers();
    console.log(latlngPredicted)
    
    var boolPrediction=document.getElementById("switchPrediction").checked;
    if(latlngPredicted!=undefined && boolPrediction==true){
    showPredictedMarker(latlngPredicted);
    }
});

//Managed the option value in the form related to spatial or noise spatial clustering-------------------------------------
$('#clusterOption').on('change', function (e) {
    var optionSelected = $("option:selected", this);
    var valueSelected = this.value;
    if(valueSelected=='spatial'){
        showClusters($("#cluster").val());
    }  else if(valueSelected=='spatialnoise'){
        showSpatialNoiseCluster($("#cluster").val());
    }
});

//function to predict a marker db-----------------------------------------------------
var latPredicted;
var lngPredicted;
var latlngPredicted;
map.on('click', function(e) {        
    var boolPrediction=document.getElementById("switchPrediction").checked;
    if(boolPrediction==true){
        showPredictedMarker(e);
         latlngPredicted=e;
        console.log(latlngPredicted)
        latPredicted=e.latlng.lat;
        lngPredicted=e.latlng.lng;
    }
});

//Slider for blur heatmap--------------------------------------------------------------
var blurSlider = document.getElementById("blur");

blurSlider.oninput = function () {
    console.log(blurSlider);
    heatMap.setOptions({
        blur: parseInt(this.value)
    });
    // render the new options
    heatMap.redraw();
    console.log($("#blur").val());
}

//Slider for radius of heatmap----------------------------------------------------------
var radiusSlider = document.getElementById("radius");
radiusSlider.oninput = function () {
    heatMap.setOptions({
        radius: parseInt(this.value)
    });
    // render the new options
    heatMap.redraw();
}

// Slider for k setting for k-means clustering-----------------------------------------------
var clusterSlider = document.getElementById("cluster");
clusterSlider.oninput = function () {
    console.log(this.value);
    if($('#clusterOption').val()=="spatial"){
    showClusters(this.value);
    }else {
    showSpatialNoiseCluster(this.value);
    }
    
}

// color managing for n=18 cluster each with different color--------------------------------------
function getColorArray() {
    console.log($('#cluster').value);
    var colorArray=[];
    for (var i = 1; i < 18; i++) {
     
        var color;
    switch( true ) {
        case (i==1) :
            color='#4ef542'
            break;
        case (i==2) :
            color='#f5f242'
            break;
        case (i==3) :
            color='#4287f5'
            break;
        case (i==4) :
            color='#f54242'
            break;
        case (i==5) :
            color='#c842f5'
            break;
        case (i==6) :
            color='#42f5a1'
            break;
        case (i==7) :
            color='#619114'
            break;
        case (i==8) :
            color='#995837'
            break;
        case (i==9) :
            color='#543799'
            break;
        case (i==10) :
            color='#752249'
            break;
        case (i==11) :
            color='#666341'
            break;
        case (i==12) :
            color='#755668'
            break;
        case (i==13) :
            color='#403312'
            break;
        case (i==14) :
            color='#a60871'
            break;
        case (i==15) :
            color='#4a4448'
            break;
        case (i==16) :
            color='#b0ba9c'
            break;
        case (i==17) :
            color='#0e5440'
            break;
        case (i==18) :
            color='#e1f2ed'
            break;
            default:
    }
    
    colorArray.push(color);
    console.log(color)
    }
    console.log(colorArray);
    return colorArray;
  }


// Checkbox trigger for cluster settings (markers,polygons,centroids)
function checkboxCluster(checkboxElem) {
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


$('#resetFilter').on('click', function () {
 $('#blur').val(15);
 $('#radius').val(25);
 showHeatmap();
});

// TODO
// Temporal Radio Buttons
/*
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
});*/
