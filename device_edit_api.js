import config from './config.js';

export async function editData(newData) {
    try{
        // console.log(newData)
        const { patchUrl, authToken} = config;
        const response = await fetch(`${patchUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: newData
        });
      
        if (!response.ok) {
          throw new Error(`Failed to patch data: ${response.statusText}`);
        }
        return response.json();

    } catch (error) {
        console.error('Error:', error);
        return error
    }
}


export async function fetchData() {
    const { rootUrl, authToken, securityUrl, eventDetailUrl, energyDetailUrl } = config;
    function parseQueryString(queryString) {
        return Object.fromEntries(new URLSearchParams(queryString));
    }
    
    async function callAPI(apiUrl, filters, fields) {
        // const apiUrlWithParams = new URL(`${rootUrl}${apiUrl}`);
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


        var apiUrl = `/items/camera_device`;
        var filters = {
            'filter[id][_eq]': obj.device
        };
        var fields = 'id,name,zone_id.floor_id.image,pos_x,pos_y,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
        var data = await callAPI(apiUrl, filters, fields)
        console.log(data)
        output.image = data[0].zone_id.floor_id.image
        

        // apiUrl = `/items/devices`;
        // filters = {
        //     'filter[zone_id][floor_id][_eq]': obj.floors[0],
        //     // 'filter[device_model_id][_in]': obj.device_model_id
        // };
        // obj.device_model_id = `14cba9f1-850b-4524-a214-98a9f8d32851`
        // // console.log(obj.device_model_id)
        // fields = 'id,name,pos_x,pos_y,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
        // if (obj.device_model_id !== undefined && obj.device_model_id !== null) {
        //     fields += `${encodeURIComponent(`&filter[device_model_id][_in]=${obj.device_model_id}`)}`;
        // }

        // data = await callAPI(apiUrl, filters, fields)
        // console.log(data)
        const mappedData = data.map(item => ({
            name: item.name,
            position: item.pos_x + ',' + item.pos_y,
            icon: item.device_model_id.icon,
            id: item.id,
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
        // obj.device_model_id = `14cba9f1-850b-4524-a214-98a9f8d32851`
        // // console.log(obj.device_model_id)
        // fields = 'id,polygon,name,pos_x,pos_y,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
        // if (obj.device_model_id !== undefined && obj.device_model_id !== null) {
        //     fields += `${encodeURIComponent(`&filter[device_model_id][_in]=${obj.device_model_id}`)}`;
        // }
        // data = await callAPI(apiUrl, filters, fields)
        // console.log(data)
        // var mappedData2 = output.item
        // output.item = data.map(item => ({
        //     name: item.name,
        //     position: item.polygon,
        //     // icon: item.device_model_id.icon,
        //     id: item.id,
        //     // onhover: true,
        //     // Include other fields as needed
        // }));
        // // output.item = output.item || [];
        // // output.item = output.item.concat(mappedData2);

        // for (var i = 0; i < output.item.length; i++) {
        //     apiUrl = `/items/interval_reports`;
        //     filters = {
        //         'filter': `{"_and":[{"_and":[{"timestamp":{"_lte":"$NOW"}},{"timestamp":{"_gte":"$NOW(-1day)"}}]},{"device_id":{"id":{"_eq":"${output.item[i].id}"}}}]}`,
        //         // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
        //         // 'filter[device_model_id][_in]': obj.device_model_id
        //     };
        //     fields = `id%26aggregate%5Bmin%5D=energy_kwh%26aggregate%5Bmax%5D=energy_kwh%26aggregate%5Bavg%5D=power_kw%26groupBy=device_id`;
        //     data = await callAPI(apiUrl, filters, fields)

        //     // console.log(data)

        //     let sumPowerKw = data.reduce((accumulator, currentValue) => {
        //         return accumulator + currentValue.avg.power_kw;
        //     }, 0);
        //     output.item[i].power = sumPowerKw.toFixed(3);

        //     let sumEnergyKwH = data.reduce((accumulator, currentValue) => {
        //         return accumulator + (currentValue.max.energy_kwh - currentValue.min.energy_kwh);
        //     }, 0);
        //     output.item[i].energy = sumEnergyKwH.toFixed(3);
        // }

        // output.item.sort((a, b) => parseFloat(b.energy) - parseFloat(a.energy));
        // for (var i = 0; i < output.item.length; i++) {
        //     if (i < colorArray.length) {
        //         output.item[i].color = colorArray[i]
        //     } else {
        //         output.item[i].color = colorArray[colorArray.length - 1]
        //     }
        // }

        // output.item = output.item || [];
        // output.item = output.item.concat(mappedData2);

        console.log(output)
        return output;
    } catch (error) {
        console.error('Error:', error);
    }
}
