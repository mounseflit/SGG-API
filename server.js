const express = require("express");
const axios = require("axios");
const cors = require("cors");
const pdfParse = require('pdf-parse');
const { JSDOM } = require('jsdom');
const { fromBuffer } = require("pdf2pic");
const path = require("path");

// Using axios instead of node-fetch
const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());








////////////////// FRENCH ////////////////////


// Get ModuleId and TabId for French
async function GetModuleIdTabIdFr() {
    // Get current date
    const today = new Date();
    const year = String(today.getFullYear());
    const month = String(today.getMonth() + 1).padStart(2, '0');

    const url = 'https://www.sgg.gov.ma/BulletinOfficiel.aspx';

    // URL of the Bulletin Officiel website
    console.log('Scraping URL:', url);

    try {
        // Fetch the website HTML using axios instead of fetch
        const response = await axios.get(`https://aicrafters-scraper-api.vercel.app/scrape?url=${encodeURIComponent(url)}&type=scripts`, {
            timeout: 5000 // 5 second timeout
        });

        if (!response.data) {
            throw new Error('No data received from scraper API');
        }

        const result = response.data.result;

    // Further processing of the retrieved data can be done here
    // search for "ModuleId =" and "var TabId ="  using regex
    
    // Ensure result is a string before applying regex
    const resultStr = String(result);
    
    // Find all occurrences of ModuleId using regex
    const moduleIdMatches = [...resultStr.matchAll(/ModuleId\s*=\s*(\d+)/g)];
    const tabIdMatches = [...resultStr.matchAll(/var TabId\s*=\s*(\d+)/g)];
    
    // Get the first TabId if available
    const tabId = tabIdMatches.length > 0 ? tabIdMatches[0][1] : null;

    // Find the smallest ModuleId
    let moduleId = null;
    if (moduleIdMatches.length > 0) {
        moduleId = moduleIdMatches.reduce((min, match) => {
            const current = parseInt(match[1], 10);
            return current < min ? current : min;
        }, parseInt(moduleIdMatches[0][1], 10)).toString();
    }

    console.log('Found ModuleIds:', moduleIdMatches.map(m => m[1]));
    console.log('Found TabIds:', tabIdMatches.map(m => m[1]));
    console.log('Selected ModuleId (smallest):', moduleId);
    console.log('Selected TabId (first):', tabId);

    return { moduleId, tabId };

    } catch (error) {
        console.error('Error in GetModuleIdTabIdFr:', error.message);
        // Rethrow to allow proper error handling by caller
        throw new Error(`Failed to get module and tab IDs: ${error.message}`);
    }
}

// Get the latest Bulletin Officiel for French
async function GetBOfr(moduleId, tabId) {

    const url = "https://www.sgg.gov.ma/DesktopModules/MVC/TableListBO/BO/AjaxMethod";

    const headers = {
        "ModuleId": moduleId,
        "TabId": tabId,
        "RequestVerificationToken": ""
    };

    try {
        const response = await axios.get(url, { headers });

        if (response.data && Array.isArray(response.data)) {
            const latestBO = response.data[0];

            // Parse the data
            const parsedBO = {
                BoId: latestBO.BoId,
                BoNum: latestBO.BoNum,
                BoDate: new Date(parseInt(latestBO.BoDate.match(/\d+/)[0], 10)), // Convert to Date object
                BoUrl: latestBO.BoUrl.startsWith("https://www.sgg.gov.ma") ? latestBO.BoUrl : `https://www.sgg.gov.ma${latestBO.BoUrl}`
            };

            console.log('Parsed BO:', parsedBO);
            return parsedBO;
        }

        // console.log('Could not find latest BO in response:', response.data);
        return null;

    } catch (error) {

        console.error('Error fetching data:', error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
            console.error('Headers:', JSON.stringify(error.response.headers));
            if (error.config) {
                console.error('Request URL:', error.config.url);
                console.error('Request Method:', error.config.method);
            }
        }

        return null;
    }
}

// Get History of French Bulletin Officiel
async function GetMoreBOfr(moduleId, tabId) {
    
const url = "https://www.sgg.gov.ma/DesktopModules/MVC/TableListBO/BO/AjaxMethod";

const headers = {
    "ModuleId": moduleId,
    "TabId": tabId,
    "RequestVerificationToken": ""
};


    try {
        const response = await axios.get(url, { headers });

        
        if (response.data && Array.isArray(response.data)) {
            // Map all BOs to parsed format
            const parsedBOs = response.data.map(bo => ({
            BoId: bo.BoId,
            BoNum: bo.BoNum,
            BoDate: new Date(parseInt(bo.BoDate.match(/\d+/)[0], 10)), // Convert to Date object
            BoUrl: bo.BoUrl.startsWith("https://www.sgg.gov.ma") ? bo.BoUrl : `https://www.sgg.gov.ma${bo.BoUrl}`
            }));

            console.log('All Parsed BOs Json:', parsedBOs);
            return parsedBOs;
        }

        // console.log('Could not find All BO in response:', response.data);
        return null;
        
        
    } catch (error) {
        
        console.error('Error fetching data:', error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
            console.error('Headers:', JSON.stringify(error.response.headers));
            if (error.config) {
                console.error('Request URL:', error.config.url);
                console.error('Request Method:', error.config.method);
            }
        }

        return null;
    }

}

// Route for french document
app.get("/api/BO/FR", async (_, res) => {
    try {
        
        // First try to get ModuleId and TabId, use constant values if function fails
        let moduleId, tabId;
        try {
            const result = await GetModuleIdTabIdFr();
            moduleId = result.moduleId;
            tabId = result.tabId;
        } catch (error) {
            console.log('Failed to get dynamic IDs, using fallback values:', error.message);
            moduleId = "2873";
            tabId = "775";
        }


        // If we got the IDs, use them, otherwise fall back to hardcoded values
        const bofr = await GetBOfr(moduleId, tabId);
        if (bofr) {
            res.json(bofr); // Return parsed BO data
        } else {
            res.status(404).json({ error: "Latest Bulletin Officiel not found" });
        }
    } catch (error) {
        console.error("Error in /api/BO/FR:", error);
        res.status(500).json({ error: "Failed to retrieve French Bulletin Officiel" });
    }
});

// Route for text inside French document
app.get("/api/BO/Text/FR", async (_, res) => {
    try {
        
        // First try to get ModuleId and TabId, use constant values if function fails
        let moduleId, tabId;
        try {
            const result = await GetModuleIdTabIdFr();
            moduleId = result.moduleId;
            tabId = result.tabId;
        } catch (error) {
            console.log('Failed to get dynamic IDs, using fallback values:', error.message);
            moduleId = "2873";
            tabId = "775";
        }


        // Use the dynamic ModuleId and TabId
        const boar = await GetBOar(moduleId, tabId);

        if (boar) {
            //get link from results
            const link = boar.BoUrl;

            console.log('Link to latest Bulletin Officiel:', link);

            // Fetch the text content from the link
            const textContent = await fetch(`https://pdf2text-umber.vercel.app/api/pdf-text-all?pdfUrl=${encodeURIComponent(link)}`)
                .then(response => response.json())
                .then(data => data.text)
                .catch(error => {
                    console.error('Error fetching text content:', error);
                    return null;
                });

            if (textContent) {

                res.json({ text: textContent });
                // console.log(textContent);
                console.log('Text content retrieved successfully');
            } else {
                res.status(404).json({ error: "Text content not found" });
            }
        } else {
            res.status(404).json({ error: "Latest Bulletin Officiel not found" });
        }

    } catch (error) {
        console.error("Error in /api/BO/FR/Text:", error);
        res.status(500).json({ error: "Failed to retrieve French Bulletin Officiel text" });
    }
});

// Route for All french documents
app.get("/api/BO/ALL/FR", async (_, res) => {

    try {

        // First try to get ModuleId and TabId, use constant values if function fails
        let moduleId, tabId;
        try {
            const result = await GetModuleIdTabIdFr();
            moduleId = result.moduleId;
            tabId = result.tabId;
        } catch (error) {
            console.log('Failed to get dynamic IDs, using fallback values:', error.message);
            moduleId = "2873";
            tabId = "775";
        }


        // Use the dynamic ModuleId and TabId
        const allbofr = await GetMoreBOfr(moduleId, tabId);

        if (allbofr) {
            res.json(allbofr); // Return parsed BO data
        } else {
            res.status(404).json({ error: "No French Bulletin Officiel was found" });
        }
    } catch (error) {
        console.error("Error in /api/BO/ALL/FR:", error);
        res.status(500).json({ error: "Failed to retrieve All French Bulletin Officiel" });
    }
});




////////////////// ARABIC ////////////////////


// Get ModuleId and TabId for Arabic
async function GetModuleIdTabIdAr() {
    // Get current date
    const today = new Date();
    const year = String(today.getFullYear());
    const month = String(today.getMonth() + 1).padStart(2, '0');

    const url = 'https://www.sgg.gov.ma/arabe/BulletinOfficiel.aspx';

    // URL of the Bulletin Officiel website
    console.log('Scraping URL:', url);

    try {
        // Fetch the website HTML using axios instead of fetch
        const response = await axios.get(`https://aicrafters-scraper-api.vercel.app/scrape?url=${encodeURIComponent(url)}&type=scripts`, {
            timeout: 5000 // 5 second timeout
        });

        if (!response.data) {
            throw new Error('No data received from scraper API');
        }

        const result = response.data.result;

    // Further processing of the retrieved data can be done here
    // search for "ModuleId =" and "var TabId ="  using regex
    
    // Ensure result is a string before applying regex
    const resultStr = String(result);
    
    // Find all occurrences of ModuleId using regex
    const moduleIdMatches = [...resultStr.matchAll(/ModuleId\s*=\s*(\d+)/g)];
    const tabIdMatches = [...resultStr.matchAll(/var TabId\s*=\s*(\d+)/g)];
    
    // Get the first TabId if available
    const tabId = tabIdMatches.length > 0 ? tabIdMatches[0][1] : null;
    
    // Find the biggest ModuleId
    let moduleId = null;
    if (moduleIdMatches.length > 0) {
        moduleId = moduleIdMatches.reduce((max, match) => {
            const current = parseInt(match[1], 10);
            return current > max ? current : max;
        }, parseInt(moduleIdMatches[0][1], 10)).toString();
    }

    console.log('Found ModuleIds:', moduleIdMatches.map(m => m[1]));
    console.log('Found TabIds:', tabIdMatches.map(m => m[1]));
    console.log('Selected ModuleId (biggest):', moduleId);
    console.log('Selected TabId (first):', tabId);

    return { moduleId, tabId };

    } catch (error) {
        console.error('Error in GetModuleIdTabIdFr:', error.message);
        // Rethrow to allow proper error handling by caller
        throw new Error(`Failed to get module and tab IDs: ${error.message}`);
    }
}

// Get the latest Bulletin Officiel for Arabic
async function GetBOar(moduleId, tabId) {
    const url = "https://www.sgg.gov.ma/DesktopModules/MVC/TableListBO/BO/AjaxMethod";

    const headers = {
        "ModuleId": moduleId,
        "TabId": tabId,
        "RequestVerificationToken": ""
    };

    try {
        const response = await axios.get(url, { headers });

        if (response.data && Array.isArray(response.data)) {
            const latestBO = response.data[0];

            // Parse the data
            const parsedBO = {
                BoId: latestBO.BoId,
                BoNum: latestBO.BoNum,
                BoDate: new Date(parseInt(latestBO.BoDate.match(/\d+/)[0], 10)), // Convert to Date object
                BoUrl: latestBO.BoUrl.startsWith("https://www.sgg.gov.ma") ? latestBO.BoUrl : `https://www.sgg.gov.ma${latestBO.BoUrl}`
            };

            console.log('Parsed BO:', parsedBO);
            return parsedBO;
        }

        // console.log('Could not find latest BO in response:', response.data);
        return null;

    } catch (error) {

        console.error('Error fetching data:', error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
            console.error('Headers:', JSON.stringify(error.response.headers));
            if (error.config) {
                console.error('Request URL:', error.config.url);
                console.error('Request Method:', error.config.method);
            }
        }

        return null;
    }
}

// Get History of Arabic Bulletin Officiel
async function GetMoreBOar(moduleId, tabId) {
    
const url = "https://www.sgg.gov.ma/DesktopModules/MVC/TableListBO/BO/AjaxMethod";

const headers = {
    "ModuleId": moduleId,
    "TabId": tabId,
    "RequestVerificationToken": ""
};


    try {
        const response = await axios.get(url, { headers });

        
        if (response.data && Array.isArray(response.data)) {
            // Map all BOs to parsed format
            const parsedBOs = response.data.map(bo => ({
            BoId: bo.BoId,
            BoNum: bo.BoNum,
            BoDate: new Date(parseInt(bo.BoDate.match(/\d+/)[0], 10)), // Convert to Date object
            BoUrl: bo.BoUrl.startsWith("https://www.sgg.gov.ma") ? bo.BoUrl : `https://www.sgg.gov.ma${bo.BoUrl}`
            }));

            console.log('All Parsed BOs Json:', parsedBOs);
            return parsedBOs;
        }

        // console.log('Could not find All BO in response:', response.data);
        return null;
        
        
    } catch (error) {
        
        console.error('Error fetching data:', error.message);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
            console.error('Headers:', JSON.stringify(error.response.headers));
            if (error.config) {
                console.error('Request URL:', error.config.url);
                console.error('Request Method:', error.config.method);
            }
        }

        return null;
    }

}

// Route for Arabic document
app.get("/api/BO/AR", async (_, res) => {
    try {

        // First try to get ModuleId and TabId, use constant values if function fails
        let moduleId, tabId;
        try {
            const result = await GetModuleIdTabIdAr();
            moduleId = result.moduleId;
            tabId = result.tabId;
        } catch (error) {
            console.log('Failed to get dynamic IDs, using fallback values:', error.message);
            moduleId = "3111";
            tabId = "847";
        }


        // Use the dynamic ModuleId and TabId
        const boar = await GetBOar(moduleId, tabId);
        if (boar) {
            res.json(boar); // Return parsed BO data
        } else {
            res.status(404).json({ error: "Latest Bulletin Officiel not found" });
        }

    } catch (error) {
        console.error("Error in /api/BO/AR:", error);
        res.status(500).json({ error: "Failed to retrieve Arabic Bulletin Officiel" });
    }
});

// Route for text inside Arabic documents
app.get("/api/BO/Text/AR", async (_, res) => {
    try {
        
        // First try to get ModuleId and TabId, use constant values if function fails
        let moduleId, tabId;
        try {
            const result = await GetModuleIdTabIdAr();
            moduleId = result.moduleId;
            tabId = result.tabId;
        } catch (error) {
            console.log('Failed to get dynamic IDs, using fallback values:', error.message);
            moduleId = "3111";
            tabId = "847";
        }


        // Use the dynamic ModuleId and TabId
        const boar = await GetBOar(moduleId, tabId);

        if (boar) {
            //get link from results
            const link = boar.BoUrl;

            console.log('Link to latest Bulletin Officiel:', link);

            // Fetch the text content from the link
            const textContent = await fetch(`https://pdf2text-umber.vercel.app/api/pdf-text-all?pdfUrl=${encodeURIComponent(link)}`)
                .then(response => response.json())
                .then(data => data.text)
                .catch(error => {
                    console.error('Error fetching text content:', error);
                    return null;
                });

            if (textContent) {

                res.json({ text: textContent });
                // console.log(textContent);
                console.log('Text content retrieved successfully');
            } else {
                res.status(404).json({ error: "Text content not found" });
            }
        } else {
            res.status(404).json({ error: "Latest Bulletin Officiel not found" });
        }

    } catch (error) {
        console.error("Error in /api/BO/AR/Text:", error);
        res.status(500).json({ error: "Failed to retrieve Arabic Bulletin Officiel text" });
    }
});

// Route for All arabic documents
app.get("/api/BO/ALL/AR", async (_, res) => {

    try {
        // First try to get ModuleId and TabId, use constant values if function fails
        let moduleId, tabId;
        try {
            const result = await GetModuleIdTabIdAr();
            moduleId = result.moduleId;
            tabId = result.tabId;
        } catch (error) {
            console.log('Failed to get dynamic IDs, using fallback values:', error.message);
            moduleId = "3111";
            tabId = "847";
        }


        // Use the dynamic ModuleId and TabId
        const allboar = await GetMoreBOar(moduleId, tabId);

        if (allboar) {
            res.json(allboar); // Return parsed BO data
        } else {
            res.status(404).json({ error: "No Arabic Bulletin Officiel was found" });
        }
    } catch (error) {
        console.error("Error in /api/BO/ALL/AR:", error);
        res.status(500).json({ error: "Failed to retrieve All Arabic Bulletin Officiel" });
    }
});









app.get("/api/health", (_, res) => {
    res.status(200).json({ status: "ok" });
});

// demo serve test.html
app.get("/demo", (_, res) => {
    res.sendFile(path.join(__dirname, "test.html"));
});

// Default route
app.get("/", (_, res) => {
     res.sendFile(path.join(__dirname, "index.html"));
});

// Export for Vercel serverless function
module.exports = app;

// Start server if running directly (development)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}


