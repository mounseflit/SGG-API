const axios = require('axios');

const url = "https://www.sgg.gov.ma/DesktopModules/MVC/TableListBO/BO/AjaxMethod";

const headers = {
    "ModuleId": "2873",
    "TabId": "775",
    "RequestVerificationToken": ""
};

async function fetchData() {
    try {
        const response = await axios.get(url, { headers });
        
        // Print the response status code and content
        console.log(`Status Code: ${response.status}`);
        // Print the response but convert it to string
        console.log(`Response: ${JSON.stringify(response.data)}`);
    } catch (error) {
        console.error('Error fetching data:', error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        }
    }
}

fetchData();