import config from './config.js';

export async function fetchData() {
    function parseQueryString(queryString) {
        return Object.fromEntries(new URLSearchParams(queryString));
    }
    try {
        var sPageURL = decodeURIComponent(window.location.search.substring(1));
        var sURLVariables = sPageURL.split('&');
        var param = ''
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if(param.length > 0){
                param = param + '&' + sParameterName[0] + '=' + sParameterName[1]
            }
            else param = sParameterName[0] + '=' + sParameterName[1]
        }
        const obj = parseQueryString(param)
        // console.log(obj)
        const { rootUrl,  authToken } = config;

        const apiUrl = `${rootUrl}/items/devices`;
        const filters = {
            'filter[zone_id][floor_id][_eq]': obj.floor_id,
            'filter[device_model_id][_in]': obj.device_model_id
        };
        const fields = 'id,name,x_position,y_position,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';

        const apiUrlWithParams = new URL(apiUrl);
        apiUrlWithParams.search = new URLSearchParams(filters).toString() + `&fields=${fields}`;

        const headers = {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json' 
        };

        const response = await fetch(apiUrlWithParams, {
            method: 'GET', 
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data.data);
        return data.data;
    } catch (error) {
        console.error('Error:', error);
    }
}
