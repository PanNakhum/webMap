import { editData, fetchData } from './device_edit_all_api.js';
var selectId;
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

    for (let i in data.item) {
        // var color = 'rgba(243, 175, 61, 1)';
        // if (data.item[i].power > 700) {
        //     color = 'rgba(236, 99, 64, 1)';
        // }
        // var color = 'rgba(0, 0, 0, 0)';
        // // color = 'rgba(243, 175, 61, 1)'
        // if (data.item[i].status == 'firing') {
        //     color = 'rgba(236, 99, 64, 1)';
        // } else if (data.item[i].status == 'acknowledged') {
        //     color = 'rgba(243, 175, 61, 1)';
        // }

        if (data.item[i].icon != null) {
            var LeafIcon = L.Icon.extend({
                options: {
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    // color: color,
                    // className: 'blinking',
                    iconUrl: data.item[i].icon
                }
            });
            var customIcon = new LeafIcon();
            // console.log(parseInt((Math.random() * 10).toFixed(0)) + data.item[i].position.split(",")[0]);
            var marker = L.marker([data.item[i].position.split(",")[0], data.item[i].position.split(",")[1]], { icon: customIcon });
            // console.log(data.item[i])
            // console.log(`<b>${data.item[i].name}</b><br><b>Power: </b>${parseFloat(data.item[i].power).toLocaleString()} kW<br><b>Energy(Day): </b>${parseFloat(data.item[i].energy).toLocaleString()} kWh`)
            marker.bindTooltip(data.item[i].name, {
                offset: [0, -45],
                direction: 'top',
                permanent: true,
                // direction: 'center',
                // className: 'custom-tooltip',
                // opacity: '1'
            });
            marker.on('click', function () {
                // Open the link when the marker is clicked
                selectId = data.item[i].id
                // console.log
                allMarkersObjArray[i].getTooltip().setContent(`<b>${data.item[i].name}</b>`);
                allMarkersObjArray[i].getTooltip().update();
                updateData()
                // console.log(data.item[i].name)
                // window.open(data.item[i].link, '_top');
            });
            markers.addLayer(marker);
            allMarkersObjArray.push(marker)
        } else if (data.item[i].position != null) {
            // console.log("write polygon")
            const coordinates = data.item[i].position.split("],[")
                .map(coord => coord.replace(/\[|\]/g, ""))
                .map(coord => coord.split(",").map(Number));
            // console.log(coordinates)
            var polygon = L.polygon(coordinates, {
                color: data.item[i].color, //'black', // 'rgba(236, 99, 64, 1)',    // Border color of the polygon
                fillColor: data.item[i].color, //'rgba(236, 99, 64, 1)', // Fill color of the polygon
                fillOpacity: 0.5  // Opacity of the fill color (0 is fully transparent, 1 is fully opaque)
            }).addTo(map);
            // polygon._path.classList.add('blinking');

            // Add the polygon to the map
            polygon.addTo(map);

            allMarkersObjArray.push(polygon)

            // // Add an onClick event to forward to obj[i].link
            polygon.on('click', function () {
                // window.open(data.item[i].link, "_top");
            });

        }
    }

    async function updateData() {
        data = await fetchData();

        for (let i = 0; i < allMarkersObjArray.length; i++) {
            map.removeLayer(allMarkersObjArray[i]);

        }
        allMarkersObjArray = []



        for (let i in data.item) {
            // var color = 'rgba(243, 175, 61, 1)';
            // var color = 'rgba(0, 0, 0, 0)';
            // // color = 'rgba(243, 175, 61, 1)'
            // if (data.item[i].status == 'firing') {
            //     color = 'rgba(236, 99, 64, 1)';
            // } else if (data.item[i].status == 'acknowledged') {
            //     color = 'rgba(243, 175, 61, 1)';
            // }

            if (data.item[i].icon != null) {
                var LeafIcon = L.Icon.extend({
                    options: {
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        permanent: true,
                        // color: color,
                        // className: 'blinking',
                        iconUrl: data.item[i].icon
                    }
                });
                var customIcon = new LeafIcon();
                if(data.item[i].id == selectId){
                    data.item[i].name = `<b>${data.item[i].name}</b>`;
                    // allMarkersObjArray[i].getTooltip().getElement().style.backgroundColor = 'red';
                    // LeafIcon.options.className = 'blinking';
                }else{
                    
                }
                // console.log(parseInt((Math.random() * 10).toFixed(0)) + data.item[i].position.split(",")[0]);
                var marker = L.marker([data.item[i].position.split(",")[0], data.item[i].position.split(",")[1]], { icon: customIcon });
                marker.bindTooltip(data.item[i].name, {
                    offset: [0, -45],
                    permanent:true,
                    direction: 'top'
                });

                marker.on('click', function () {
                    // Open the link when the marker is clicked
                    // window.open(data.item[i].link, '_top');
                    selectId = data.item[i].id
                    // console.log
                    allMarkersObjArray[i].getTooltip().setContent(`<b>${data.item[i].name}</b>`);
                    // allMarkersObjArray[i].getTooltip().getElement().style.backgroundColor = 'red';
                    allMarkersObjArray[i].getTooltip().update();
                    updateData()
                });
                markers.addLayer(marker);
                allMarkersObjArray.push(marker)
            } else if (data.item[i].position != null) {
                const coordinates = data.item[i].position.split("],[")
                    .map(coord => coord.replace(/\[|\]/g, ""))
                    .map(coord => coord.split(",").map(Number));
                // console.log(coordinates)
                var polygon = L.polygon(coordinates, {
                    color: data.item[i].color, //'black', // 'rgba(236, 99, 64, 1)',    // Border color of the polygon
                    fillColor: data.item[i].color, //'rgba(236, 99, 64, 1)', // Fill color of the polygon
                    fillOpacity: 0.7  // Opacity of the fill color (0 is fully transparent, 1 is fully opaque)
                }).addTo(map);
                // polygon._path.classList.add('blinking');
                // console.log(color)
                allMarkersObjArray.push(polygon)



                // Add a tooltip to the polygon with closeOnClick set to false
                // polygon.bindTooltip(data.item[i].name, { closeOnClick: false });
                // polygon.bindPopup(data.item[i].name);

                // // Add an onClick event to forward to obj[i].link
                polygon.on('click', function () {
                    // window.open(data.item[i].link, "_top");
                });

            }
        }
    }

    setInterval(async function () {
        await updateData();
    }, 60 * 1000);

    // var str = '';
    async function onMapClick(e) {
        // str += ("[" + e.latlng.lat + ", " + e.latlng.lng + "],")
        // alert("[" + e.latlng.lat + ", " + e.latlng.lng + "]");
        // alert(str)
        if(selectId == undefined) return ;
        var index;
        for(index in data.item){
            if(data.item[index].id == selectId) break ;
        }
        var result = window.confirm(`Do you want to change device "${data.item[index].name.replace(/<[^>]*>/g, '')}" from (${data.item[index].position}) to (${parseInt(e.latlng.lat)},${parseInt(e.latlng.lng)}) ?`);
        if (result) {
            // console.log("Yes")
            // console.log(selectId)
            await editData(selectId,`{"position_x":${parseInt(e.latlng.lat)},"position_y":${parseInt(e.latlng.lng)}}`)
            // console.log(res)
            selectId = undefined
            updateData()
            // alert("You clicked 'Yes'");
        }
        // else {
        //     // console.log("No")
        //     // alert("You clicked 'No'");
        // }
    }
    map.on('click', onMapClick);
}

init();
