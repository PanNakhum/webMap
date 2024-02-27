import config from './config.js';

export async function fetchData() {
    const { rootUrl, authToken, securityUrl, eventDetailUrl, energyDetailUrl } = config;
    function parseQueryString(queryString) {
        return Object.fromEntries(new URLSearchParams(queryString));
    }
    async function callAPI(apiUrl, filters, fields) {
        const apiUrlWithParams = new URL(`${rootUrl}${apiUrl}`);
        apiUrlWithParams.search = new URLSearchParams(filters).toString() + `&fields=${fields}`;
        // const apiUrlWithParams = new URL(`${rootUrl}`);
        // apiUrlWithParams.search = `?param=${apiUrl}?` + new URLSearchParams(filters).toString() + `%26fields=${fields}`;
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
            },
            button: {
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
            var fields = 'image,floor,building_id';
            var data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            output.image = data[0].image
            let floor_key = data[0].floor
            obj.buildings[0] = data[0].building_id


            apiUrl = `/items/hik_devices`;
            filters = {
                'filter': `{"_and":[{"floor":{"_eq":"${floor_key}"}},{"building_id":{"_eq":"${obj.buildings[0]}"}}]}`,
            };
            fields = 'id,name,position_x,position_y,icon,server_id,src_index,src_type,site_id.label,project_id.label,building_id.label,floor';
            data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            const mappedData = data.map(item => ({
                name: item.name,
                position: item.position_x + ',' + item.position_y,
                icon: item.icon,
                id: item.id,
                link: `${energyDetailUrl}?var-device_id=${item.id}`,
                server_id: item.server_id,
                src_index: item.src_index,
                src_type: item.src_type,
                site: item.site_id.label,
                project: item.project_id.label,
                building: item.building_id.label,
                floor: item.floor
                // Include other fields as needed
            }));
            output.item = mappedData;
            // console.log(output)

            for (var i = 0; i < output.item.length; i++) {
                if (output.item[i].server_id.length != 0 && output.item[i].src_index.length != 0 && output.item[i].src_type.length != 0) {
                    apiUrl = `/items/hik_events`;
                    filters = {
                        'filter': `{"_and":[{"_or":[{"status":{"_in":["firing","acknowledged"]}},{"status":{"_null":true}}]},{"server_id":{"_in":${JSON.stringify(output.item[i].server_id)}}},{"src_index":{"_in":${JSON.stringify(output.item[i].src_index)}}},{"src_type":{"_in":${JSON.stringify(output.item[i].src_type)}}}]}`,
                        // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                        // 'filter[device_model_id][_in]': obj.device_model_id
                    };
                    fields = `status,event_id.icon,happen_time,event_id.name&limit=1`;
                    data = await callAPI(apiUrl, filters, fields)
                    // console.log(data)

                    if (data.length === 0) {
                        output.item[i].status = "resolved";
                    } else if (data.length === 1 && data[0].status !== null) {
                        output.item[i].status = data[0].status;
                        output.item[i].icon = data[0].event_id.icon
                        const inputDateString = data[0].happen_time;
                        const inputDate = new Date(inputDateString);
                        const options = {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                            timeZone: 'Asia/Bangkok' // Replace with your local timezone
                        };
                        const formattedDate = inputDate.toLocaleString('en-US', options);
                        output.item[i].name = `<b>Position:</b> ${output.item[i].site} - ${output.item[i].project} - ${output.item[i].building} - ${output.item[i].floor}<br><b>Time:</b> ${formattedDate}<br><b>Error type:</b> ${data[0].event_id.name}<br><b>Status:</b> ${data[0].status}`
                    } else {
                        output.item[i].status = "firing";
                        output.item[i].icon = data[0].event_id.icon

                        const inputDateString = data[0].happen_time;
                        const inputDate = new Date(inputDateString);
                        const options = {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,
                            timeZone: 'Asia/Bangkok' // Replace with your local timezone
                        };
                        const formattedDate = inputDate.toLocaleString('en-US', options);
                        output.item[i].name = `<b>Position:</b> ${output.item[i].site} - ${output.item[i].project} - ${output.item[i].building} - ${output.item[i].floor}<br><b>Time:</b> ${formattedDate}<br><b>Error type:</b> ${data[0].event_id.name}<br><b>Status:</b> ${data[0].status}`
                    }
                } else { output.item[i].status = "resolved"; }
            }

            // if (arrayOfserver_id.length != 0 && arrayOfsrc_index.length != 0 && arrayOfsrc_type.length != 0) {
            //     apiUrl = `/items/hik_events`;
            //     filters = {
            //         'filter': `{"_and":[{"_or":[{"status":{"_in":["firing","acknowledged"]}},{"status":{"_null":true}}]},{"server_id":{"_in":${JSON.stringify(arrayOfserver_id)}}},{"src_index":{"_in":${JSON.stringify(arrayOfsrc_index)}}},{"src_type":{"_in":${JSON.stringify(arrayOfsrc_type)}}}]}`,
            //         // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
            //         // 'filter[device_model_id][_in]': obj.device_model_id
            //     };
            //     fields = `status&limit=1`;
            //     data = await callAPI(apiUrl, filters, fields)
            //     // console.log(data)

            //     if (data.length === 0) {
            //         output.item[i].status = "resolved";
            //     } else if (data.length === 1 && data[0].status !== null) {
            //         output.item[i].status = data[0].status;
            //     } else {
            //         output.item[i].status = "firing";
            //     }
            // } else { output.item[i].status = "resolved"; }

            // console.log("Line 117")
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
            //     fields = `id,device_id.zone_id.floor_id.building_id.project_id.label,device_id.zone_id.floor_id.building_id.label,device_id.zone_id.floor_id.label,timestamp,status,error_code.code,error_code.label,error_code.icon,device_id.id,device_id.label%26limit=1`;
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
            //         output.item[matchingIndex].label = `<b>Position:</b> ${data[0].device_id.zone_id.floor_id.building_id.project_id.label} - ${data[0].device_id.zone_id.floor_id.building_id.label} - ${data[0].device_id.zone_id.floor_id.label} - ${data[0].device_id.label}<br><b>Time:</b> ${formattedDate}<br><b>Error type:</b> ${data[0].error_code.label}<br><b>Status:</b> ${status}`;
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

            apiUrl = `/items/floors`;
            filters = {
                'filter[building_id][_eq]': obj.buildings[0]
                // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            fields = 'label,polygon,floor,floor_num';
            data = await callAPI(apiUrl, filters, fields)
            // use ID for check status 

            const mappedData = data.map(item => ({
                name: item.label,
                position: item.polygon,
                id: item.floor,
                link: `${securityUrl}?var-v_projects=${obj.projects[0]}&var-v_buildings=${obj.buildings[0]}&var-v_floors=${item.id}`
            }));
            output.item = mappedData;

            const mappedDataB = data.map(item => ({
                name: item.label,
                floor_num: item.floor_num,
                link: `${securityUrl}?var-v_projects=${obj.projects[0]}&var-v_buildings=${obj.buildings[0]}&var-v_floors=${item.id}`,
            }));
            mappedDataB.sort((b, a) => {
                return a.floor_num - b.floor_num;
            });
            output.button = mappedDataB;
            // console.log(mappedDataB);

            // mappedDataB.sort((b, a) => {
            //     if (isNaN(a.name) && isNaN(b.name)) {
            //         return a.name.localeCompare(b.name);
            //     } else if (isNaN(a.name)) {
            //         return 1;
            //     } else if (isNaN(b.name)) {
            //         return -1;
            //     } else {
            //         return b.name - a.name;
            //     }
            // });
            // output.button = mappedDataB;

            for (var i = 0; i < output.item.length; i++) {
                apiUrl = `/items/hik_devices`;
                filters = {
                    'filter': `{"_and":[{"building_id":{"_eq":"${obj.buildings[0]}"}},{"floor":{"_eq":"${output.item[i].id}"}}]}`,
                };
                fields = `server_id,src_index,src_type`;
                data = await callAPI(apiUrl, filters, fields)
                // console.log(output.item[i])
                // console.log(data)
                let arrayOfserver_id = data.map(obj => obj.server_id);
                // console.log(arrayOfserver_id)
                let arrayOfsrc_index = data.map(obj => obj.src_index);
                // console.log(arrayOfsrc_index)
                let arrayOfsrc_type = data.map(obj => obj.src_type);
                // console.log(arrayOfsrc_type)

                if (arrayOfserver_id.length != 0 && arrayOfsrc_index.length != 0 && arrayOfsrc_type.length != 0) {
                    apiUrl = `/items/hik_events`;
                    filters = {
                        'filter': `{"_and":[{"_or":[{"status":{"_in":["firing","acknowledged"]}},{"status":{"_null":true}}]},{"server_id":{"_in":${JSON.stringify(arrayOfserver_id)}}},{"src_index":{"_in":${JSON.stringify(arrayOfsrc_index)}}},{"src_type":{"_in":${JSON.stringify(arrayOfsrc_type)}}}]}`,
                        // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                        // 'filter[device_model_id][_in]': obj.device_model_id
                    };
                    fields = `status&limit=1`;
                    data = await callAPI(apiUrl, filters, fields)
                    // console.log(data)

                    if (data.length === 0) {
                        output.item[i].status = "resolved";
                    } else if (data.length === 1 && data[0].status !== null) {
                        output.item[i].status = data[0].status;
                    } else {
                        output.item[i].status = "firing";
                    }
                } else { output.item[i].status = "resolved"; }
            }

            // for (var i = 0; i < output.item.length; i++) {
            //     apiUrl = `/items/fault_code_reports`;
            //     filters = {
            //         'filter': `{"_and":[{"_or":[{"status":{"_in":["firing","acknowledged"]}} , {"status":{"_null":true}}]} , { "device_id": { "zone_id" :{ "floor_id" :{ "id" :{ "_eq": "${output.item[i].id}" }}}}}]}`,
            //     };
            //     fields = `status,error_code,device_id.id,device_id.label,device_id.zone_id.floor_id.building_id.project_id.label%26groupBy=status%26aggregate%5Bcount%7D=*`;
            //     data = await callAPI(apiUrl, filters, fields)

            //     if (data.length === 0) {
            //         output.item[i].status = "resolved";
            //     } else if (data.length === 1 && data[0].status !== null) {
            //         output.item[i].status = data[0].status;
            //     } else {
            //         output.item[i].status = "firing";
            //     }
            // }

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
            fields = 'id,label,polygon,id%26filter%5Bstatus%5D%5B_eq%5D=true'; //%26filter%5Bstatus%7D%5B_eq%7D: true  &filter[status][_eq]=true'
            data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            const mappedData = data.map(item => ({
                id: item.id,
                name: item.label,
                position: item.polygon,
                link: `${securityUrl}?var-v_projects=${obj.projects[0]}&var-v_buildings=${item.id}`,
                // Include other fields as needed
            }));
            output.item = mappedData;
            // console.log(output)
            for (var i = 0; i < output.item.length; i++) {
                apiUrl = `/items/hik_devices`;
                filters = {
                    'filter': `{"_and":[{"building_id":{"_eq":"${output.item[i].id}"}} ]}`,
                };
                fields = `server_id,src_index,src_type`;
                data = await callAPI(apiUrl, filters, fields)
                // console.log(output.item[i])
                // console.log(data)
                let arrayOfserver_id = data.map(obj => obj.server_id);
                // console.log(arrayOfserver_id)
                let arrayOfsrc_index = data.map(obj => obj.src_index);
                // console.log(arrayOfsrc_index)
                let arrayOfsrc_type = data.map(obj => obj.src_type);
                // console.log(arrayOfsrc_type)

                if (arrayOfserver_id.length != 0 && arrayOfsrc_index.length != 0 && arrayOfsrc_type.length != 0) {
                    apiUrl = `/items/hik_events`;
                    filters = {
                        'filter': `{"_and":[{"_or":[{"status":{"_in":["firing","acknowledged"]}},{"status":{"_null":true}}]},{"server_id":{"_in":${JSON.stringify(arrayOfserver_id)}}},{"src_index":{"_in":${JSON.stringify(arrayOfsrc_index)}}},{"src_type":{"_in":${JSON.stringify(arrayOfsrc_type)}}}]}`,
                        // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                        // 'filter[device_model_id][_in]': obj.device_model_id
                    };
                    fields = `status&limit=1`;
                    data = await callAPI(apiUrl, filters, fields)
                    // console.log(data)

                    if (data.length === 0) {
                        output.item[i].status = "resolved";
                    } else if (data.length === 1 && data[0].status !== null) {
                        output.item[i].status = data[0].status;
                    } else {
                        output.item[i].status = "firing";
                    }
                } else { output.item[i].status = "resolved"; }
            }
        } else {
            //use theme project(ALL) show polygon projects
            var apiUrl = `/items/sites`;
            var filters = {
                'filter[id][_eq]': obj.sites
            };
            var fields = 'image,id';
            var data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            output.image = data[0].image

            apiUrl = `/items/projects`;
            filters = {
                'filter[site_id][_eq]': obj.sites,
                // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                // 'filter[device_model_id][_in]': obj.device_model_id
            };
            fields = 'label,polygon,id';
            data = await callAPI(apiUrl, filters, fields)
            // console.log(data)
            const mappedData = data.map(item => ({
                name: item.label,
                position: item.polygon,
                id: item.id,
                link: `${securityUrl}?var-v_projects=${item.id}`,
                // Include other fields as needed
            }));
            output.item = mappedData;
            // console.log(output)

            for (var i = 0; i < output.item.length; i++) {
                apiUrl = `/items/hik_devices`;
                filters = {
                    'filter': `{"_and":[{"project_id":{"_eq":"${output.item[i].id}"}} ]}`,
                };
                fields = `server_id,src_index,src_type`;
                data = await callAPI(apiUrl, filters, fields)
                // console.log(output.item[i])
                // console.log(data)
                let arrayOfserver_id = data.map(obj => obj.server_id);
                // console.log(arrayOfserver_id)
                let arrayOfsrc_index = data.map(obj => obj.src_index);
                // console.log(arrayOfsrc_index)
                let arrayOfsrc_type = data.map(obj => obj.src_type);
                // console.log(arrayOfsrc_type)

                if (arrayOfserver_id.length != 0 && arrayOfsrc_index.length != 0 && arrayOfsrc_type.length != 0) {
                    apiUrl = `/items/hik_events`;
                    filters = {
                        'filter': `{"_and":[{"_or":[{"status":{"_in":["firing","acknowledged"]}},{"status":{"_null":true}}]},{"server_id":{"_in":${JSON.stringify(arrayOfserver_id)}}},{"src_index":{"_in":${JSON.stringify(arrayOfsrc_index)}}},{"src_type":{"_in":${JSON.stringify(arrayOfsrc_type)}}}]}`,
                        // 'filter[zone_id][floor_id][_eq]': obj.floor_id,
                        // 'filter[device_model_id][_in]': obj.device_model_id
                    };
                    fields = `status&limit=1`;
                    data = await callAPI(apiUrl, filters, fields)
                    // console.log(data)

                    if (data.length === 0) {
                        output.item[i].status = "resolved";
                    } else if (data.length === 1 && data[0].status !== null) {
                        output.item[i].status = data[0].status;
                    } else {
                        output.item[i].status = "firing";
                    }
                } else { output.item[i].status = "resolved"; }
            }

        }
        // const data_ = 

        console.log(output)
        return output;
    } catch (error) {
        console.error('Error:', error);
    }
}
