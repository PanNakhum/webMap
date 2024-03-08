import { fetchData } from './event_detail_api.js';

async function callAPI(apiUrl) {
    // const apiUrlWithParams = new URL(`${rootUrl}${apiUrl}`);
    // apiUrlWithParams.search = new URLSearchParams(filters).toString() + `&fields=${fields}`;
    const apiUrlWithParams = new URL(`${apiUrl}`);
    // apiUrlWithParams.search = `?param=${apiUrl}?` + new URLSearchParams(filters).toString() + `%26fields=${fields}`;
    // console.log(apiUrlWithParams)
    // const headers = {
    //     Authorization: `Bearer ${authToken}`,
    //     'Content-Type': 'application/json'
    // };

    const response = await fetch(apiUrlWithParams, {
        method: 'GET',
        // headers: headers
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    // console.log(data.data);
    return data.data
}

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

    var customButton = L.Control.extend({
        options: {
            // position: 'bottomleft'
            position: 'topright'
        }, onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-Create');
            container.innerHTML = `${data.button[0].name}`;
            container.onclick = function () {
                // Add alert here
                var ci = data.button[0].link
                Swal.fire({
                    title: `Are you sure?`,
                    text: `This action will create an incident.`,
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: 'Yes, create it!',
                    cancelButtonText: 'Cancel'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            var dataAPI = await callAPI(ci)
                            // console.log(data)
                            Swal.fire({
                                title: "Create Incident!",
                                text: "Incident has been created.",
                                icon: "success",
                                confirmButtonText: "Open incident detail in new tab."
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    console.log("Open incident detail in new tab.")
                                    window.open(dataAPI, '_blank');
                                    // Here you can open incident detail in new tab
                                }
                            });

                        } catch (error) {
                            console.error(error);
                        }
                    }
                });

            };
            return container;
        }
    });
    map.addControl(new customButton());

    var customButton = L.Control.extend({
        options: {
            // position: 'bottomleft'
            position: 'topright'
        }, onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-ig');
            container.innerHTML = `${data.button[1].name}`;
            container.onclick = function () {
                var ig = data.button[1].link
                Swal.fire({
                    title: `Are you sure?`,
                    text: `This action will ignore an event.`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: 'Yes, ignore it!',
                    cancelButtonText: 'Cancel'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            var dataAPI = await callAPI(ig)
                            console.log(dataAPI)
                            Swal.fire({
                                title: "Ignore!",
                                text: "Event has been ignore.",
                                icon: "success",
                            })
                        } catch (error) {
                            console.error(error);
                        }
                    }
                });

            };
            return container;
        }
    });
    map.addControl(new customButton());


    // if (data.button.length > 1) {
    //     for (let i in data.button) {
    //         var customButton = L.Control.extend({
    //             options: {
    //                 // position: 'bottomleft'
    //                 position: 'topright'
    //             },

    //             onAdd: function (map) {
    //                 var container = L.DomUtil.create('div', 'leaflet-control-custom');
    //                 container.innerHTML = `${data.button[i].name}`;
    //                 container.onclick = function () {
    //                     // Add alert here
    //                     if (data.button[i].name == "Create Incident") {
    //                         var ci = data.button[i].link
    //                         Swal.fire({
    //                             title: `Are you sure?`,
    //                             text: `This action will create an incident.`,
    //                             icon: "question",
    //                             showCancelButton: true,
    //                             confirmButtonColor: "#3085d6",
    //                             cancelButtonColor: "#d33",
    //                             confirmButtonText: 'Yes, create it!',
    //                             cancelButtonText: 'Cancel'
    //                         }).then(async (result) => {
    //                             if (result.isConfirmed) {
    //                                 try {
    //                                     var dataAPI = await callAPI(ci)
    //                                     // console.log(data)
    //                                     Swal.fire({
    //                                         title: "Create Incident!",
    //                                         text: "Incident has been created.",
    //                                         icon: "success",
    //                                         confirmButtonText: "Open incident detail in new tab."
    //                                     }).then((result) => {
    //                                         if (result.isConfirmed) {
    //                                             console.log("Open incident detail in new tab.")
    //                                             window.open(dataAPI, '_blank');
    //                                             // Here you can open incident detail in new tab
    //                                         }
    //                                     });

    //                                 } catch (error) {
    //                                     console.error(error);
    //                                 }
    //                             }
    //                         });
    //                     } else {
    //                         var ig = data.button[i].link
    //                         Swal.fire({
    //                             title: `Are you sure?`,
    //                             text: `This action will ignore an event.`,
    //                             icon: "warning",
    //                             showCancelButton: true,
    //                             confirmButtonColor: "#3085d6",
    //                             cancelButtonColor: "#d33",
    //                             confirmButtonText: 'Yes, ignore it!',
    //                             cancelButtonText: 'Cancel'
    //                         }).then(async (result) => {
    //                             if (result.isConfirmed) {
    //                                 try {
    //                                     var dataAPI = await callAPI(ig)
    //                                     console.log(dataAPI)
    //                                     Swal.fire({
    //                                         title: "Ignore!",
    //                                         text: "Event has been ignore.",
    //                                         icon: "success",
    //                                     })
    //                                 } catch (error) {
    //                                     console.error(error);
    //                                 }
    //                             }
    //                         });
    //                     }
    //                 };
    //                 return container;
    //             }
    //         });
    //         map.addControl(new customButton());
    //     }
    // }


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
            var marker = L.marker([data.item[i].position.split(",")[0], data.item[i].position.split(",")[1]], { icon: customIcon });
            marker.bindTooltip(data.item[i].name, {
                offset: [0, -45],
                permanent: true,
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

    async function updateData() {
        data = await fetchData();

        for (let i = 0; i < allMarkersObjArray.length; i++) {
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
                var marker = L.marker([data.item[i].position.split(",")[0], data.item[i].position.split(",")[1]], { icon: customIcon });
                marker.bindTooltip(data.item[i].name, {
                    offset: [0, -45],
                    permanent: true,
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
    }, 15 * 1000);
}

init();
