import config from './config.js';

export async function fetchData() {
    const { rootUrl, authToken } = config;
    function parseQueryString(queryString) {
        return Object.fromEntries(new URLSearchParams(queryString));
    }
    async function callAPI(apiUrl, filters, fields) {
        // const apiUrlWithParams = new URL`${rootUrl}${apiUrl}`;
        // apiUrlWithParams.search = new URLSearchParams(filters).toString() + `&fields=${fields}`;
        const apiUrlWithParams = new URL(`${rootUrl}`);
        apiUrlWithParams.search = `?param=${apiUrl}?` + new URLSearchParams(filters).toString() + `&fields=${fields}`;
        console.log(apiUrlWithParams)
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
        // console.log(data.data);
        return data.data
    }
    try {
        var sPageURL = decodeURIComponent(window.location.search.substring(1));
        var sURLVariables = sPageURL.split('&');
        var param = ''
        for (var i = 0; i < sURLVariables.length; i++) {
            var sParameterName = sURLVariables[i].split('=');
            if (param.length > 0) {
                param = param + '&' + sParameterName[0] + '=' + sParameterName[1].split(',')
            }
            else param = sParameterName[0] + '=' + sParameterName[1].split(',')
        }
        const obj = parseQueryString(param)
        // console.log(obj)
        obj.projects = obj.projects.split(',')
        obj.buildings = obj.buildings.split(',')
        obj.floors = obj.floors.split(',')
        console.log(obj)

        var output = {
            image: 'urlLink',
            item: {
                name: 'name',
                icon: 'iconlink',
                link: 'click',
                status: 'normal',
                position: 'position'
            }
        }

        if (obj.floors.length == 1) {
            //use floor show device
            var apiUrl = `/items/floors`;
            var filters = {
                'filter[id][_eq]': obj.floors[0]
            };
            var fields = 'image';
            var data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            output.image = data[0].image


            apiUrl = `/items/devices`;
            filters = {
                'filter[zone_id][floor_id][_eq]': obj.floors[0],
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            console.log(obj.device_model_id)
            if (obj.device_model_id !== undefined && obj.device_model_id !== null) {
                filters['filter[device_model_id][_in]'] = obj.device_model_id;
              }
            fields = 'id,name,x_position,y_position,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
            data = await callAPI(apiUrl, filters, fields)
            const mappedData = data.map(item => ({
                name: item.name,
                position: item.x_position + ',' + item.y_position,
                icon: item.device_model_id.icon
                // Include other fields as needed
            }));
            output.item = mappedData;
            

            // for dev DB
            apiUrl = `/items/camera_device`;
            filters = {
                'filter[zone_id][floor_id][_eq]': obj.floors[0],
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            console.log(obj.device_model_id)
            if (obj.device_model_id !== undefined && obj.device_model_id !== null) {
                filters['filter[device_model_id][_in]'] = obj.device_model_id;
              }
            fields = 'id,name,pos_x,pos_y,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
            data = await callAPI(apiUrl, filters, fields)
            const mappedData2 = data.map(item => ({
                name: item.name,
                position: item.pos_x + ',' + item.pos_y,
                icon: item.device_model_id.icon
                // Include other fields as needed
            }));
            output.item = output.item || [];
            output.item = output.item.concat(mappedData2);


            console.log(data)

        } else if (obj.buildings.length == 1) {
            //use buildings show polygon floors
            var apiUrl = `/items/buildings`;
            var filters = {
                'filter[id][_eq]': obj.buildings[0]
            };
            var fields = 'image';
            var data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            output.image = data[0].image

            apiUrl = `/items/floors`;
            filters = {
                'filter[building_id][_eq]': obj.buildings[0]
                // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            fields = 'name,polygon,id';
            data = await callAPI(apiUrl, filters, fields)
            // use ID for check status 

            const mappedData = data.map(item => ({
                name: item.name,
                position: item.polygon,
                id: item.id,
            }));
            output.item = mappedData;

        } else if (obj.projects.length == 1) {
            //use projects show polygon buildings
            var apiUrl = `/items/projects`;
            var filters = {
                'filter[id][_eq]': obj.projects[0]
            };
            var fields = 'image';
            var data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            output.image = data[0].image

            apiUrl = `/items/buildings`;
            filters = {
                'filter[project_id][_eq]': obj.projects[0]
                // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            fields = 'name,polygon';
            data = await callAPI(apiUrl, filters, fields)

            const mappedData = data.map(item => ({
                name: item.name,
                position: item.polygon,
                // Include other fields as needed
            }));
            output.item = mappedData;

        } else {
            //use theme project(ALL) show polygon projects
            var apiUrl = `/items/projects`;
            var filters = {
                'filter[id][_eq]': obj.projects[0]
            };
            var fields = 'theme_project_id.image,theme_project_id.id';
            var data = await callAPI(apiUrl, filters, fields)
            console.log(data)
            output.image = data[0].theme_project_id.image
            const theme_project_id = data[0].theme_project_id.id

            apiUrl = `/items/projects`;
            filters = {
                'filter[theme_project_id][_eq]': theme_project_id,
                // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            fields = 'name,polygon';
            data = await callAPI(apiUrl, filters, fields)

            const mappedData = data.map(item => ({
                name: item.name,
                position: item.polygon,
                // Include other fields as needed
            }));
            output.item = mappedData;

        }
        // const data_ = 

        console.log(output)
        return output;
    } catch (error) {
        console.error('Error:', error);
    }
}
