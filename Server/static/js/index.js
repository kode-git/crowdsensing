var map = L.map('map',{zoomSnap: 0.25,
    zoomDelta: 0.5,minZoom:5}).setView([44.494960715733576, 11.344000549862148], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);


$(".leaflet-control-zoom").css("visibility", "hidden");
$('.cd-filter-block h4').toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
$("#colorizeMarker").removeClass().removeAttr('style');


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
const markerC= new L.layerGroup();
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

                    }  else if($("#clusterOption").val()=='spatialnoise'){

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
function clusterFilter(data,nCluster){
   // console.log(data.features.length)
   // console.log(data.features[0].properties.db)
   
    var points=[]
    for (i=0;i<data.features.length;i++){
        //console.log(data.features[i].properties.db)
               if(data.features[i].properties.cluster==nCluster){
                points.push(data.features[i].properties.db);
                
            }
        
    }
    /*
    var options = $("#list option");                    // Collect options 
    console.log(options)        
options.detach().sort(function(a,b) {               // Detach from select, then Sort
    var at = $(a).text();
    console.log(at);
    var bt = $(b).text();   
    console.log(bt)      
    return (at > bt)?1:((at < bt)?-1:0);            // Tell the sort function how to order
});
options.appendTo("#list"); 
*/


var listColor=getColorArray();   
    
    $('#list').append($('<option>', {
        value: nCluster,
        text: "DB: "+Math.min(... points)+ '-'+Math.max(... points) ,
      
    }));
    $("#list option[value="+nCluster+"]").css({"background-color":  listColor[ nCluster]});
    
console.log("CLUSTER: ",nCluster," : ",Math.min(... points), '-',Math.max(... points) )

}


$('#loading').hide(); 
var load;
var latitudine;
var longitudine;

var dataCluster;
function showSpatialNoiseCluster(num) {
   
    markerC.clearLayers();
    spatialnoiselayer.clearLayers();
    load=1;
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
            dataCluster=data;
            load=0;
            optionsReset();
    for(i=0;i<=num-1;i++){
        clusterFilter(data,i)
            }
            
        $('#loading').hide(); 


            var listColor=getColorArray();        
            var i=0;
            marker = L.geoJson(data, {
                pointToLayer: function (feature, latlng) {
                        var geojsonColorizeOptions={
                            radius: 4,
                            fillColor: listColor[ feature.properties.cluster],
                            color: "#000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                    }
                    latitudine=latlng.lat;
                    longitudine=latlng.lng;
                    return L.circleMarker(latlng, geojsonColorizeOptions);
                    
                }, onEachFeature: function (feature, layer) {
                  /*  while(k<=180){

                        for(j=0;j<=num;j++){
                            if(feature.properties.cluster==j){
                                points.push(feature.properties.db)
                            }

                    }
                }*/
                   // console.log(points)
                   // for(i=0;i<data.size();i++){

                    /*for(j=0;j<=num;j++){
                        if(feature.properties.cluster==j){
                            console.log("index "+i+" has cluster:  "+j)
                            //points.push([j,i])
                            points[j].push(i);
                        }else{
                            
                            points[j].push(19);
                        }
                    }
              //  }*/
              
            
              i++;
                    //console.table(points);
                    
                    layer.bindPopup('<p>DB: ' + feature.properties.db + '\n QoS: '+feature.properties.qos +'\n Cluster: '+ feature.properties.cluster +'</p>');
                   
                    
                
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
            
            console.log($('#list').length);
            optionsOrdering();
        }
    });
};

//-----------------------------NOISE ON FILTER-------------------------------------------------------


var markerCluster
function showSpatialNoiseClusterFilter(n,size) {
    
   console.log(n);
   
    console.log("---------------------------------------------------------")
    data=dataCluster;
    markerC.clearLayers();
    spatialnoiselayer.clearLayers();
console.log(data);
            var listColor=getColorArray();        
           //
           
          // var markerCluster;
           console.log(data.features[1].geometry.coordinates)
           for(i=0;i<180;i++){
            
               if(data.features[i].properties.cluster==n){
                var geojsonColorizeOptions={
                    radius: size,
                    fillColor: listColor[ data.features[i].properties.cluster],
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
            }
                   console.log("---------------------------------------------------------------------")
                   console.log("DB DEI DATI: ",data.features[i].properties.cluster)
                   console.log("N CLUSTER: ",data.features[i].geometry.coordinates)
             markerCluster = L.circleMarker([data.features[i].geometry.coordinates[1],data.features[i].geometry.coordinates[0]], geojsonColorizeOptions);//.bindPopup('<span>Mean Noise:</span>' +data.clusters[i].properties.db + ' </br> <p> <span> ' + data.clusters[i].geometry.coordinates.length + '</span> points belongs to this cluster </p>');
             // map.addLayer(markerC);
             var marker = L.circleMarker([51.5, -0.09])
            markerC.addLayer(markerCluster);
            markerC.addLayer(marker);
            map.addLayer(markerC);
        }else{
            
            console.log(data.features[i].properties.cluster)
           // var marker = L.marker([51.5, -0.09])
           // markerC.addLayer(marker);
           // map.addLayer(markerC);
        }
        }
                 
            markerlayer.clearLayers();
            heatmaplayer.clearLayers();
            clusterlayer.clearLayers();
            vertexlayer.clearLayers();
            centroidlayer.clearLayers();
            predictedlayer.clearLayers();
        
            
        
   
};

//---------------------------OPTION ORDERING---------------------------------------------------------
function optionsOrdering(){
var options = $("#list option");                    // Collect options 
    console.log(options)        
options.detach().sort(function(a,b) {               // Detach from select, then Sort
    var at = $(a).text();
   // console.log(at);
    var bt = $(b).text();   
   // console.log(bt)      
    return (at > bt)?1:((at < bt)?-1:0);            // Tell the sort function how to order
});
options.appendTo("#list"); 
console.log( $('#list > option'));
}

//---------------------------OPTION RESET-------------------------
function optionsReset(){
    /*var length = $('#list > option').length;
console.log(length);
for(i=0;i<length;i++){
    var x = document.getElementById("#list");
  console.log($('#list > option'));
*/
$('#list')
    .find('option')
    .remove()
    .end()


}
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
            
            var listColor=getColorArray();  
            kmeans = parseInt(mapZoom)
            for (let i = 0; i < kmeans; i++) {
                
                
            
            if(document.getElementById("colorizeCluster").checked==false){
                
                var geojsonPolygonOptions = {
                    fillColor: getColor(data.clusters[i].properties.db),
                    weight: 4,
                    opacity: 1,
                    color: getColorDarker(data.clusters[i].properties.db),
                    fillOpacity: 0.5,
                    smoothFactor: 3
                    
                };
            }else{
                
                var geojsonPolygonOptions = {
                    fillColor: listColor[data.clusters[i].properties.cluster],
                    weight: 4,
                    opacity: 1,
                    color: LightenDarkenColor(listColor[data.clusters[i].properties.cluster], -40),
                    fillOpacity: 0.5,
                    smoothFactor: 3
                    
                };
            }
            /*
            var geojsonPolygonOptions = {
                    fillColor: getColor(data.clusters[i].properties.db),
                    weight: 4,
                    opacity: 1,
                    color: getColorDarker(data.clusters[i].properties.db),
                    fillOpacity: 0.5,
                    smoothFactor: 3
                    
                };*/
                
                
                
                if(document.getElementById("colorizeCluster").checked==false){

                    var geojsonMarkerOptions = {
                        fillColor: getColor(data.clusters[i].properties.db),
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    };
                }else{

                    
                    var geojsonMarkerOptions = {
                        fillColor: listColor[data.clusters[i].properties.cluster],
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    };

                }
               
                var polygon = L.polygon(data.clusters[i].geometry.coordinates, geojsonPolygonOptions).bindPopup('<span>Mean Noise:</span>' +data.clusters[i].properties.db + ' </br> <p> <span> ' + data.clusters[i].geometry.coordinates.length + '</span> points belongs to this cluster </p>');
               
                if(document.getElementById("colorizeCluster").checked==false){

                    

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

                   
                }else{

                    polygon.on('mouseover', function () {
                        this.setStyle({
                            'fillColor': LightenDarkenColor(listColor[data.clusters[i].properties.cluster], -40)
                        })
                    });
                    polygon.on('mouseout', function () {
                        this.setStyle({
                            'fillColor': listColor[data.clusters[i].properties.cluster]
                        });
                    });
                }
               
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

            centroidlayer.addLayer(icon);

                //Both layers from centroids and cluster geometries
                clusterlayer.addLayer(polygon); //
                centroidlayer.addLayer(centroid); //
                
                for (let j = 0; j < data.locations.length; j++) {    
                    var lat = data.locations[j].geometry.coordinates[0];
                    var lng = data.locations[j].geometry.coordinates[1];
                    var latlng = new L.latLng(lat, lng);

               
                    


                    
                if(document.getElementById("colorizeCluster").checked==false){

                    

                    var geojsonVertexOptions = {
                        radius: 3,
                        fillColor: getColor(data.locations[j].properties.db),
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    };
                }else{

                    //if((data.locations[j].properties.cluster==data.clusters[i].properties.cluster)){
                    var geojsonVertexOptions = {
                        radius: 3,
                        fillColor: listColor[data.locations[j].properties.cluster],
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    };
               // }
                }




                    
                    var vertex = L.circleMarker(latlng, geojsonVertexOptions).bindPopup('<h1>' + data.locations[j].properties.db + 'db </h1>');
                    
                    vertexlayer.addLayer(vertex);
                    
                }
            }


            //document.getElementById("cluster").value=kmeans;
                   layerOrdering() 
        }
    })
}


function layerOrdering(){

    var cls=document.getElementById("plg").checked;
    var vtx=document.getElementById("mrk").checked;
    var cnt=document.getElementById("cnt").checked;
map.removeLayer(centroidlayer);
map.removeLayer(vertexlayer);
map.removeLayer(clusterlayer);
    switch (true) {
        case (cls === true && vtx === true && cnt === true) ://TTT
            map.addLayer(clusterlayer);
            map.addLayer(vertexlayer);        
            map.addLayer(centroidlayer);
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
            map.addLayer(vertexlayer);
            
        map.addLayer(centroidlayer);
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

// Checkbox trigger for cluster settings (markers,polygons,centroids)
function checkboxCluster(checkboxElem) {
    
    if (checkboxElem.checked ) {
       // map.addLayer(eval(checkboxElem.name));
       layerOrdering()
    } else{
        layerOrdering()
        map.removeLayer(eval(checkboxElem.name));
    }
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

    
    var boolPrediction=document.getElementById("switchPrediction").checked;
    if(latlngPredicted!=undefined && boolPrediction==true){
    showPredictedMarker(latlngPredicted);
    }
});

$('#list').change(function () {
    showSpatialNoiseClusterFilter($(this).val(),$('#markersize').val())
    //showHeatmap();
    console.log($(this).val())
});
$('#colorizeMarker').change(function () {
    showMarkers();

    
    var boolPrediction=document.getElementById("switchPrediction").checked;
    if(latlngPredicted!=undefined && boolPrediction==true){
    showPredictedMarker(latlngPredicted);
    }
});


//COLORIZE CLUSTER----------------------------------------------------
$('#colorizeCluster').change(function () {
    showClusters($('#cluster').val());
    
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

         latPredicted=e.latlng.lat;
        lngPredicted=e.latlng.lng;
    }
});

//Slider for blur heatmap--------------------------------------------------------------
var blurSlider = document.getElementById("blur");

blurSlider.oninput = function () {

    heatMap.setOptions({
        blur: parseInt(this.value)
    });
    // render the new options
    heatMap.redraw();

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

    if($('#clusterOption').val()=="spatial"){
    showClusters(this.value);
    }else {
    showSpatialNoiseCluster(this.value);
    }
    
}

// color managing for n=18 cluster each with different color--------------------------------------
function LightenDarkenColor(col, amt) {
  
    var usePound = false;
  
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
 
    var num = parseInt(col,16);
 
    var r = (num >> 16) + amt;
 
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
 
    var b = ((num >> 8) & 0x00FF) + amt;
 
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
 
    var g = (num & 0x0000FF) + amt;
 
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
 
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  
}
  
  // TEST


function getColorArray() {

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

}

return colorArray;
  }


       
function colorizeMarker(checkboxElem) {
        showMarkers();
}


$('#resetFilter').on('click', function () {
 $('#blur').val(15);
 $('#radius').val(25);
 showHeatmap();
});

$('#markersize').on('change', function(){
    showSpatialNoiseClusterFilter($('#list').val(),$('#markersize').val());
console.log($(this).val());
//markerC.setStyle({radius:$(this).val()})
markerCluster.setRadius($(this).val());
console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
console.log(markerC._layers);
//markerC._layers.forEach(element => console.log(element));
//markerC._layers.foreach(console.log(markerC._layers.options))

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
