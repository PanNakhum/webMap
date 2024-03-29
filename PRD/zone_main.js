import { fetchData } from './zone_api.js';


async function init() {
    var data = await fetchData();
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2
    });

    var bounds = [[0, 0], [1080, 1920]];
    L.imageOverlay(data.image, bounds).addTo(map);
    map.fitBounds(bounds);
    map.setView([540, 960], -1);

    var allMarkersObjArray = []; // for marker objects
    var markers = L.layerGroup().addTo(map);

    if (data.button.length > 1) {
        for (let i in data.button) {
            var customButton = L.Control.extend({
                options: {
                    position: 'bottomleft'
                },
                
                onAdd: function (map) {
                    var container = L.DomUtil.create('div', 'leaflet-control-custom');
                    container.innerHTML = `${data.button[i].name}`;
                    container.onclick = function () {
                        // console.log(`Floor ${data.button[i].name}`);
                        window.open(data.button[i].link, '_top');
                    };
                    return container;
                }
            });
            map.addControl(new customButton());
        }
    }

    for (let i in data.item) {
        var color = 'rgba(0, 0, 0, 0)';
        // color = 'rgba(243, 175, 61, 1)'
        if (data.item[i].status == 'firing') {
            color = 'rgba(236, 99, 64, 1)';
        } else if (data.item[i].status == 'acknowledged') {
            color = 'rgba(243, 175, 61, 1)';
        }
        
        if (data.item[i].icon != null) {
            var LeafIcon = L.Icon.extend({
                options: {
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    color: color,
                    className: 'blinking',
                    iconUrl: data.item[i].icon
                }
            });
            var customIcon = new LeafIcon();
            // console.log(parseInt((Math.random() * 10).toFixed(0)) + data.item[i].position.split(",")[0]);
            var marker = L.marker([data.item[i].position.split(",")[0] , data.item[i].position.split(",")[1]], { icon: customIcon });
            marker.bindTooltip(data.item[i].name, {
                offset: [0, -45],
                direction: 'top'
            });
            marker.on('click', function () {
                // Open the link when the marker is clicked
                window.open(data.item[i].link, '_top');
            });
            markers.addLayer(marker);
            allMarkersObjArray.push(marker)
        } else {
            const coordinates = data.item[i].position.split("],[")
            .map(coord => coord.replace(/\[|\]/g, ""))
            .map(coord => coord.split(",").map(Number));
            // console.log(coordinates)
            var polygon = L.polygon(coordinates, {
                color: color, //'black', // 'rgba(236, 99, 64, 1)',    // Border color of the polygon
                fillColor: color, //'rgba(236, 99, 64, 1)', // Fill color of the polygon
                fillOpacity: 0.5  // Opacity of the fill color (0 is fully transparent, 1 is fully opaque)
            }).addTo(map);
            allMarkersObjArray.push(polygon)
            


            // Add a tooltip to the polygon with closeOnClick set to false
            polygon.bindTooltip(data.item[i].name, { closeOnClick: false });
            // polygon.bindPopup(data.item[i].name);
            
            // // Add an onClick event to forward to obj[i].link
            polygon.on('click', function () {
                window.open(data.item[i].link, "_top");
            });

        }
    }
    
    async function updateData() {
        data = await fetchData();

        for(let i = 0; i < allMarkersObjArray.length; i++){
            map.removeLayer(allMarkersObjArray[i]);
            
        }
        allMarkersObjArray = []

    

        for (let i in data.item) {
            var color = 'rgba(0, 0, 0, 0)';
            // color = 'rgba(243, 175, 61, 1)'
            if (data.item[i].status == 'firing') {
                color = 'rgba(236, 99, 64, 1)';
            } else if (data.item[i].status == 'acknowledged') {
                color = 'rgba(243, 175, 61, 1)';
            }
            
            if (data.item[i].icon != null) {
                var LeafIcon = L.Icon.extend({
                    options: {
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        color: color,
                        className: 'blinking',
                        iconUrl: data.item[i].icon
                    }
                });
                var customIcon = new LeafIcon();
                // console.log(parseInt((Math.random() * 10).toFixed(0)) + data.item[i].position.split(",")[0]);
                var marker = L.marker([data.item[i].position.split(",")[0] , data.item[i].position.split(",")[1]], { icon: customIcon });
                marker.bindTooltip(data.item[i].name, {
                    offset: [0, -45],
                    direction: 'top'
                });
                marker.on('click', function () {
                    // Open the link when the marker is clicked
                    window.open(data.item[i].link, '_top');
                });
                markers.addLayer(marker);
                allMarkersObjArray.push(marker)
            } else {
                const coordinates = data.item[i].position.split("],[")
                .map(coord => coord.replace(/\[|\]/g, ""))
                .map(coord => coord.split(",").map(Number));
                // console.log(coordinates)
                var polygon = L.polygon(coordinates, {
                    color: color, //'black', // 'rgba(236, 99, 64, 1)',    // Border color of the polygon
                    fillColor: color, //'rgba(236, 99, 64, 1)', // Fill color of the polygon
                    fillOpacity: 0.7  // Opacity of the fill color (0 is fully transparent, 1 is fully opaque)
                }).addTo(map);
                allMarkersObjArray.push(polygon)
    
    
                // Add a tooltip to the polygon with closeOnClick set to false
                polygon.bindTooltip(data.item[i].name, { closeOnClick: false });
                // polygon.bindPopup(data.item[i].name);
                
                // // Add an onClick event to forward to obj[i].link
                polygon.on('click', function () {
                    window.open(data.item[i].link, "_top");
                });
    
            }
        }
    }

    setInterval(async function () {
        await updateData();
    }, 60 * 1000);
    
    // var str = '';
    //     function onMapClick(e) {
    //         str += ("[" + e.latlng.lat + ", " + e.latlng.lng + "],")
    //         // alert("[" + e.latlng.lat + ", " + e.latlng.lng + "]");
    //         alert(str)
    //     }
    //     map.on('click', onMapClick);
}

init();
