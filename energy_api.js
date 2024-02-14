import config from './config.js';

export async function fetchData() {
    const { rootUrl, authToken, energyUrl, eventDetailUrl, energyDetailUrl } = config;
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
    const colorArray = ["#8B0000", "#ED543B", "#FFB602", "#F9D000", "#B4BB19", "#238922"];
    // const colorArray = ["#238922", "#B4BB19", "#F9D000", "#FFB602", "#ED543B", "#8B0000"];
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
                position: 'position',
                power: 'power',
                energy: 'energy',
                onhover: false,
                color: '#000000'
            },
            button:{
                name: 'name',
                link: 'link'
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
            obj.device_model_id = `14cba9f1-850b-4524-a214-98a9f8d32851`
            // console.log(obj.device_model_id)
            fields = 'id,name,x_position,y_position,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
            if (obj.device_model_id !== undefined && obj.device_model_id !== null) {
                fields += `${encodeURIComponent(`&filter[device_model_id][_in]=${obj.device_model_id}`)}`;
            }
            
            data = await callAPI(apiUrl, filters, fields)
            const mappedData = data.map(item => ({
                name: item.name,
                position: item.x_position + ',' + item.y_position,
                icon: item.device_model_id.icon,
                id: item.id,
                link: `${energyDetailUrl}?var-device_id=${item.id}`
                // Include other fields as needed
            }));
            output.item = mappedData;



            apiUrl = `/items/devices`;
            filters = {
                'filter[zone_id][floor_id][_eq]': obj.floors[0],
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            obj.device_model_id = `14cba9f1-850b-4524-a214-98a9f8d32851`
            // console.log(obj.device_model_id)
            fields = 'id,polygon,name,x_position,y_position,device_model_id.icon,zone_id.name,zone_id.floor_id.name,zone_id.floor_id.building_id.name,zone_id.floor_id.building_id.project_id.name,zone_id.floor_id.image';
            if (obj.device_model_id !== undefined && obj.device_model_id !== null) {
                fields += `${encodeURIComponent(`&filter[device_model_id][_in]=${obj.device_model_id}`)}`;
            }
            data = await callAPI(apiUrl, filters, fields)
            console.log(data)
            var mappedData2 = output.item
            output.item = data.map(item => ({
                name: item.name,
                position: item.polygon,
                // icon: item.device_model_id.icon,
                id: item.id,
                // onhover: true,
                // Include other fields as needed
            }));
            // output.item = output.item || [];
            // output.item = output.item.concat(mappedData2);

            for (var i = 0; i < output.item.length; i++) {
                apiUrl = `/items/interval_reports`;
                filters = {
                    'filter': `{"_and":[{"_and":[{"timestamp":{"_lte":"$NOW"}},{"timestamp":{"_gte":"$NOW(-1day)"}}]},{"device_id":{"id":{"_eq":"${output.item[i].id}"}}}]}`,
                    // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                    // 'filter[device_model_id][_in]': obj.device_model_id
                };
                fields = `id%26aggregate%5Bmin%5D=energy_kwh%26aggregate%5Bmax%5D=energy_kwh%26aggregate%5Bavg%5D=power_kw%26groupBy=device_id`;
                data = await callAPI(apiUrl, filters, fields)

                // console.log(data)

                let sumPowerKw = data.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.avg.power_kw;
                }, 0);
                output.item[i].power = sumPowerKw.toFixed(3);

                let sumEnergyKwH = data.reduce((accumulator, currentValue) => {
                    return accumulator + (currentValue.max.energy_kwh - currentValue.min.energy_kwh);
                }, 0);
                output.item[i].energy = sumEnergyKwH.toFixed(3);
            }

            output.item.sort((a, b) => parseFloat(b.energy) - parseFloat(a.energy));
            for (var i = 0; i < output.item.length; i++) {
                if(i < colorArray.length){
                    output.item[i].color = colorArray[i]
                }else{
                    output.item[i].color = colorArray[colorArray.length-1]
                }
            }

            output.item = output.item || [];
            output.item = output.item.concat(mappedData2);


            // for dev DB
            // apiUrl = `/items/camera_device`;
            // filters = {
            //     'filter[zone_id][floor_id][_eq]': obj.floors[0],
            //     // 'filter[device_model_id][_in]': obj.device_model_id
            // };
            // // console.log(obj.device_model_id)
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

            // // console.log("Line 117")
            // const idArray = output.item.map(obj => obj.id);
            // const idString = JSON.stringify(idArray);
            // // console.log(idString);
            // apiUrl = `/items/fault_code_reports`;
            // filters = {
            //     'filter': `{"_and":[{"status": { "_null":true }},{"device_id":{"_in":${idString}}}]}`,
            // };
            // fields = `id%26groupBy=device_id`;
            // var error_list = await callAPI(apiUrl, filters, fields)
            // // console.log(error_list);
            // for (var i = 0; i < error_list.length; i++) {
            //     // console.log(i)
            //     apiUrl = `/items/fault_code_reports`;
            //     filters = {
            //         'filter': `{"_and":[{"_or":[{"status":{"_in":["firing","acknowledged"]}} , {"status":{"_null":true}}]} , { "device_id": { "id" :{ "_eq": "${error_list[i].device_id}" }}}]}`,
            //     };
            //     fields = `id,device_id.zone_id.floor_id.building_id.project_id.name,device_id.zone_id.floor_id.building_id.name,device_id.zone_id.floor_id.name,timestamp,status,error_code.code,error_code.name,error_code.icon,device_id.id,device_id.name%26limit=1`;
            //     data = await callAPI(apiUrl, filters, fields)
            //     // console.log(data)
            //     var status = `Firing`
            //     if (data[0].status !== null) {
            //         status = data[0].status.charAt(0).toUpperCase() + data[0].status.slice(1)
            //     }
            //     const inputDateString = data[0].timestamp;
            //     const inputDate = new Date(inputDateString);

            //     const options = {
            //         day: '2-digit',
            //         month: 'short',
            //         year: 'numeric',
            //         hour: 'numeric',
            //         minute: '2-digit',
            //         second: '2-digit',
            //         hour12: false,
            //         timeZone: 'Asia/Bangkok' // Replace with your local timezone
            //     };

            //     const formattedDate = inputDate.toLocaleString('en-US', options);
            //     const matchingIndex = output.item.findIndex(item => item.id === error_list[i].device_id);
            //     if (matchingIndex !== -1 && data.length !== 0) {
            //         output.item[matchingIndex].name = `<b>Position:</b> ${data[0].device_id.zone_id.floor_id.building_id.project_id.name} - ${data[0].device_id.zone_id.floor_id.building_id.name} - ${data[0].device_id.zone_id.floor_id.name} - ${data[0].device_id.name}<br><b>Time:</b> ${formattedDate}<br><b>Error type:</b> ${data[0].error_code.name}<br><b>Status:</b> ${status}`;
            //         output.item[matchingIndex].icon = data[0].error_code.icon;
            //         output.item[matchingIndex].link = `${eventDetailUrl}?var-event_id=${data[0].id}`
            //     }
            // }

        } else if (obj.buildings.length == 1) {
            //use buildings show polygon floors
            var apiUrl = `/items/buildings`;
            var filters = {
                'filter[id][_eq]': obj.buildings[0]
            };
            var fields = 'image,project_id';
            var data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            output.image = data[0].image
            obj.projects[0] = data[0].project_id
            // console.log(obj)

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
                link: `${energyUrl}?var-v_projects=${obj.projects[0]}&var-v_buildings=${obj.buildings[0]}&var-v_floors=${item.id}`,
            }));
            output.item = mappedData;

            
            const mappedDataB = data.map(item => ({
                name: item.name,
                link: `${energyUrl}?var-v_projects=${obj.projects[0]}&var-v_buildings=${obj.buildings[0]}&var-v_floors=${item.id}`,
            }));
            mappedDataB.sort((b, a) => {
                if (isNaN(a.name) && isNaN(b.name)) {
                  return a.name.localeCompare(b.name);
                } else if (isNaN(a.name)) {
                  return 1;
                } else if (isNaN(b.name)) {
                  return -1;
                } else {
                  return b.name - a.name;
                }
              });
            output.button = mappedDataB;

            for (var i = 0; i < output.item.length; i++) {
                apiUrl = `/items/interval_reports`;
                filters = {
                    'filter': `{"_and":[{"_and":[{"timestamp":{"_lte":"$NOW"}},{"timestamp":{"_gte":"$NOW(-1day)"}}]},{"device_id":{"zone_id":{"floor_id":{"id":{"_eq":"${output.item[i].id}"}}}}}]}`,
                    // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                    // 'filter[device_model_id][_in]': obj.device_model_id
                };
                fields = `id%26aggregate%5Bmin%5D=energy_kwh%26aggregate%5Bmax%5D=energy_kwh%26aggregate%5Bavg%5D=power_kw%26groupBy=device_id`;
                data = await callAPI(apiUrl, filters, fields)

                // console.log(data)

                let sumPowerKw = data.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.avg.power_kw;
                }, 0);
                output.item[i].power = sumPowerKw.toFixed(3);

                let sumEnergyKwH = data.reduce((accumulator, currentValue) => {
                    return accumulator + (currentValue.max.energy_kwh - currentValue.min.energy_kwh);
                }, 0);
                output.item[i].energy = sumEnergyKwH.toFixed(3);
            }

            output.item.sort((a, b) => parseFloat(b.energy) - parseFloat(a.energy));
            for (var i = 0; i < output.item.length; i++) {
                if(i < colorArray.length){
                    output.item[i].color = colorArray[i]
                }else{
                    output.item[i].color = colorArray[colorArray.length-1]
                }
            }
            


            // output.item.sort((a, b) => parseFloat(b.energy) - parseFloat(a.energy));
            // console.log(output.item)

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
                'filter[project_id][_eq]': obj.projects[0],
                // 'filter[status][_eq]': true
                // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            fields = 'id,name,polygon,id%26filter%5Bstatus%5D%5B_eq%5D=true'; //%26filter%5Bstatus%7D%5B_eq%7D: true  &filter[status][_eq]=true'
            data = await callAPI(apiUrl, filters, fields)

            const mappedData = data.map(item => ({
                id: item.id,
                name: item.name,
                position: item.polygon,
                link: `${energyUrl}?var-v_projects=${obj.projects[0]}&var-v_buildings=${item.id}`,
                onhover: true,
                // Include other fields as needed
            }));
            output.item = mappedData;
            console.log(output)
            for (var i = 0; i < output.item.length; i++) {
                apiUrl = `/items/interval_reports`;
                filters = {
                    'filter': `{"_and":[{"_and":[{"timestamp":{"_lte":"$NOW"}},{"timestamp":{"_gte":"$NOW(-1day)"}}]},{"device_id":{"zone_id":{"floor_id":{"building_id":{"id":{"_eq":"${output.item[i].id}"}}}}}}]}`,
                    // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                    // 'filter[device_model_id][_in]': obj.device_model_id
                };
                fields = `id%26aggregate%5Bmin%5D=energy_kwh%26aggregate%5Bmax%5D=energy_kwh%26aggregate%5Bavg%5D=power_kw%26groupBy=device_id`;
                data = await callAPI(apiUrl, filters, fields)

                // console.log(data)

                let sumPowerKw = data.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.avg.power_kw;
                }, 0);
                output.item[i].power = sumPowerKw.toFixed(3);

                let sumEnergyKwH = data.reduce((accumulator, currentValue) => {
                    return accumulator + (currentValue.max.energy_kwh - currentValue.min.energy_kwh);
                }, 0);
                output.item[i].energy = sumEnergyKwH.toFixed(3);
            }
            output.item.sort((a, b) => parseFloat(b.energy) - parseFloat(a.energy));
            for (var i = 0; i < output.item.length; i++) {
                if(i < colorArray.length){
                    output.item[i].color = colorArray[i]
                }else{
                    output.item[i].color = colorArray[colorArray.length-1]
                }
            }

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
            fields = 'name,polygon,id';
            data = await callAPI(apiUrl, filters, fields)
            const mappedData = data.map(item => ({
                name: item.name,
                position: item.polygon,
                id: item.id,
                link: `${energyUrl}?var-v_projects=${item.id}`,
                onhover: true,
                // Include other fields as needed
            }));
            output.item = mappedData;

            for (var i = 0; i < output.item.length; i++) {
                apiUrl = `/items/interval_reports`;
                filters = {
                    'filter': `{"_and":[{"_and":[{"timestamp":{"_lte":"$NOW"}},{"timestamp":{"_gte":"$NOW(-1day)"}}]},{"device_id":{"zone_id":{"floor_id":{"building_id":{"project_id":{"id":{"_eq":"${output.item[i].id}"}}}}}}}]}`,
                    // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                    // 'filter[device_model_id][_in]': obj.device_model_id
                };
                fields = `id%26aggregate%5Bmin%5D=energy_kwh%26aggregate%5Bmax%5D=energy_kwh%26aggregate%5Bavg%5D=power_kw%26groupBy=device_id`;
                data = await callAPI(apiUrl, filters, fields)

                // console.log(data)

                let sumPowerKw = data.reduce((accumulator, currentValue) => {
                    return accumulator + currentValue.avg.power_kw;
                }, 0);
                output.item[i].power = sumPowerKw.toFixed(3);

                let sumEnergyKwH = data.reduce((accumulator, currentValue) => {
                    return accumulator + (currentValue.max.energy_kwh - currentValue.min.energy_kwh);
                }, 0);
                output.item[i].energy = sumEnergyKwH.toFixed(3);

                // console.log(sumEnergyKwH);

                // if (data.length === 0) {
                //     output.item[i].status = "resolved";
                // } else if (data.length === 1 && data[0].status !== null) {
                //     output.item[i].status = data[0].status;
                // } else {
                //     output.item[i].status = "firing";
                // }
            }
            output.item.sort((a, b) => parseFloat(b.energy) - parseFloat(a.energy));
            for (var i = 0; i < output.item.length; i++) {
                if(i < colorArray.length){
                    output.item[i].color = colorArray[i]
                }else{
                    output.item[i].color = colorArray[colorArray.length-1]
                }
            }

        }
        // const data_ = 

        console.log(output)
        return output;
    } catch (error) {
        console.error('Error:', error);
    }
}
