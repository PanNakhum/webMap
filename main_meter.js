import { fetchData } from './api_meter.js';

async function init() {
    var data = await fetchData();
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -2
    });

    var bounds = [[0, 0], [1080, 1920]];
    var image = L.imageOverlay(data[0].zone_id.floor_id.image, bounds).addTo(map);
    map.fitBounds(bounds);
    map.setView([540, 960], -1);

    var markers = L.layerGroup().addTo(map);

    for (let i in data) {
        var color = 'rgba(0, 0, 0, 0)';
        if (data[i].status == 'firing') {
            color = 'rgba(236, 99, 64, 1)';
        } else if (data[i].status == 'acknowledged') {
            color = 'rgba(243, 175, 61, 1)';
        }

        var LeafIcon = L.Icon.extend({
            options: {
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                color: color,
                className: 'blinking',
                iconUrl: data[i].device_model_id.icon
            }
        });

        var customIcon = new LeafIcon();

        var marker = L.marker([data[i].x_position, data[i].y_position], { icon: customIcon });
        marker.bindTooltip(data[i].name, {
            offset: [0, -45],
            direction: 'top'
        });
        markers.addLayer(marker);
    }
}

init();
