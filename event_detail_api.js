import config from './config.js';

export async function fetchData() {
    const { rootUrl, authToken, securityUrl, eventDetailUrl, energyDetailUrl } = config;
    function parseQueryString(queryString) {
        return Object.fromEntries(new URLSearchParams(queryString));
    }
    async function callAPI(apiUrl, filters, fields) {
        // const apiUrlWithParams = new URL`${rootUrl}${apiUrl}`;
        // apiUrlWithParams.search = new URLSearchParams(filters).toString() + `&fields=${fields}`;
        const apiUrlWithParams = new URL(`${rootUrl}`);
        apiUrlWithParams.search = `?param=${apiUrl}?` + new URLSearchParams(filters).toString() + `%26fields=${fields}`;
        // console.log(apiUrlWithParams)
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
        console.log(obj)
        // obj.projects = obj.projects.split(',')
        // obj.buildings = obj.buildings.split(',')
        // obj.floors = obj.floors.split(',')
        

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

        //use floor show device
        var apiUrl = `/items/fault_code_reports`;
        var filters = {
            'filter[id][_eq]': obj.event_id
        };
        var fields = 'status,device_id.id,device_id.name,device_id.pos_x,device_id.pos_y,error_code.name,error_code.icon,device_id.zone_id.floor_id.image,device_id.zone_id.floor_id.building_id.project_id.name,device_id.zone_id.floor_id.building_id.name,device_id.zone_id.floor_id.name,timestamp';
        var data = await callAPI(apiUrl, filters, fields)
        var status = `Firing`
        if(data[0].status !== null){
            status = data[0].status.charAt(0).toUpperCase() + data[0].status.slice(1)
        }
        const inputDateString = data[0].timestamp;
        const inputDate = new Date(inputDateString);

        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: false ,
            timeZone: 'Asia/Bangkok' // Replace with your local timezone
          };

        const formattedDate = inputDate.toLocaleString('en-US', options);

        // console.log(formattedDate);
        // console.log(data)
        output.image = data[0].device_id.zone_id.floor_id.image
        const mappedData = data.map(item => ({
                name: `<b>Position:</b> ${item.device_id.zone_id.floor_id.building_id.project_id.name} - ${item.device_id.zone_id.floor_id.building_id.name} - ${item.device_id.zone_id.floor_id.name} - ${item.device_id.name}<br><b>Time:</b> ${formattedDate}<br><b>Error type:</b> ${item.error_code.name}<br><b>Status:</b> ${status}`,
                position: item.device_id.pos_x + ',' + item.device_id.pos_y,
                icon: item.error_code.icon,
                id: item.device_id.id,
                // link: `${energyDetailUrl}?var-device_id=${item.id}`
                // Include other fields as needed
            }));
            output.item = mappedData;
        // console.log(output)


        // apiUrl = `/items/devices`;
        // filters = {
        //     'filter[zone_id][floor_id][_eq]': obj.floors[0],
        //     // 'filter[device_model_id][_in]': obj.device_model_id
        // };
        // console.log(obj.device_model_id)
        // if (obj.device_model_id !== undefined && obj.device_model_id !== null) {
        //     filters['filter[device_model_id][_in]'] = obj.device_model_id;
        // }
        // fields = 'id,name,x_position,y_position,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
        // data = await callAPI(apiUrl, filters, fields)
        // const mappedData = data.map(item => ({
        //     name: item.name,
        //     position: item.x_position + ',' + item.y_position,
        //     icon: item.device_model_id.icon,
        //     id: item.id,
        //     link: `${energyDetailUrl}?var-device_id=${item.id}`
        //     // Include other fields as needed
        // }));
        // output.item = mappedData;


        // for dev DB
        // apiUrl = `/items/camera_device`;
        // filters = {
        //     'filter[zone_id][floor_id][_eq]': obj.floors[0],
        //     // 'filter[device_model_id][_in]': obj.device_model_id
        // };
        // console.log(obj.device_model_id)
        // if (obj.device_model_id !== undefined && obj.device_model_id !== null) {
        //     filters['filter[device_model_id][_in]'] = obj.device_model_id;
        // }
        // fields = 'id,name,pos_x,pos_y,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
        // data = await callAPI(apiUrl, filters, fields)
        // const mappedData2 = data.map(item => ({
        //     name: item.name,
        //     position: item.pos_x + ',' + item.pos_y,
        //     icon: item.device_model_id.icon,
        //     id: item.id,
        //     // Include other fields as needed
        // }));

        // output.item = output.item || [];
        // output.item = output.item.concat(mappedData2);
        // for (var i = 0; i < output.item.length; i++) {
        //     apiUrl = `/items/fault_code_reports`;
        //     filters = {
        //         'filter': `{"_and":[{"_or":[{"status":{"_in":["firing","acknowledged"]}} , {"status":{"_null":true}}]} , { "device_id": { "id" :{ "_eq": "${output.item[i].id}" }}}]}`,
        //     };
        //     fields = `id,status,error_code.code,error_code.name,error_code.icon,device_id.id,device_id.name%26limit=1`;
        //     data = await callAPI(apiUrl, filters, fields)
        //     // console.log(data)
        //     if (data.length !== 0) {
        //         output.item[i].icon = data[0].error_code.icon;
        //         output.item[i].link = `${eventDetailUrl}?var-event_id=${data[0].id}`
        //     }
        // }


        // const data_ = 

        console.log(output)
        return output;
    } catch (error) {
        console.error('Error:', error);
    }
}
