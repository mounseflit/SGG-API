

# Bulletin Officiel API

## Overview
Bulletin Officiel API is a Node.js/Express service for programmatically accessing the latest Moroccan Bulletin Officiel publications in French and Arabic. It provides endpoints for metadata and full-text extraction from official PDFs, with a modern web demo for interactive exploration.

## Table of Contents
- [Installation](#installation)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Usage](#usage)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Demo](#demo)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Installation
```bash
# Clone the repository
git clone https://github.com/mounseflit/SGG-API.git

# Install dependencies
npm install

# Start the server (development)
node server.js
```

## Deployment
The API is deployed and accessible at:
```
https://bo-ma-api.vercel.app
```

For production use, simply make requests to the deployed API endpoints:
```
https://bo-ma-api.vercel.app/api/BO/FR
https://bo-ma-api.vercel.app/api/BO/Text/AR
```

The interactive demo is available at:
```
https://bo-ma-api.vercel.app/demo
```

## Architecture
- **Express.js** server (`server.js`) handles all API routes and static file serving.
- **PDF Extraction**: Uses external microservices for PDF-to-text conversion (`pdf2text-umber.vercel.app`).
- **Web Scraping**: Retrieves latest bulletin metadata by scraping the official SGG website via a proxy API (`aicrafters-scraper-api.vercel.app`).
- **Endpoints**: RESTful routes for French and Arabic bulletins, text extraction, health check, and demo.
- **Frontend**: `index.html` and `test.html` provide documentation and an interactive demo UI.

## Usage
The API runs locally at:
```
http://localhost:3000
```
Access endpoints directly or use the demo at `/demo`.

## Features
- Fetch latest Bulletin Officiel metadata (French & Arabic)
- Extract full text from official PDFs (French & Arabic)
- Modern, responsive web demo (`test.html`)
- CORS enabled for easy integration
- Health check endpoint
- Robust error handling and logging


## API Endpoints
### Metadata
- `GET /api/BO/FR` — Latest French bulletin metadata (`BoId`, `BoNum`, `BoDate`, `BoUrl`)
- `GET /api/BO/AR` — Latest Arabic bulletin metadata (`BoId`, `BoNum`, `BoDate`, `BoUrl`)
- `GET /api/BO/ALL/FR` — Array of metadata for all available French bulletins
- `GET /api/BO/ALL/AR` — Array of metadata for all available Arabic bulletins

### Full Text Extraction
- `GET /api/BO/Text/FR` — `{ text: "..." }` full extracted text from the latest French PDF
- `GET /api/BO/Text/AR` — `{ text: "..." }` full extracted text from the latest Arabic PDF

### System
- `GET /api/health` — `{ status: "ok" }` for health monitoring
- `GET /demo` — Interactive web demo
- `GET /` — API documentation page

### Example Response
```json
{
	"BoId": 5790,
	"BoNum": "7214",
	"BoDate": "2023-06-22T00:00:00.000Z",
	"BoUrl": "https://www.sgg.gov.ma/Portals/1/BO/2023/BO_7214_Ar.pdf"
}
```

### Example Array Response (All Bulletins)
```json
[
	{
		"BoId": 5789,
		"BoNum": "7214",
		"BoDate": "2023-06-22T00:00:00.000Z",
		"BoUrl": "https://www.sgg.gov.ma/Portals/0/BO/2023/BO_7214_Fr.pdf"
	},
	...
]
```


## Error Handling
- All endpoints return HTTP status codes (`200`, `404`, `500`).
- Error responses include a JSON `{ error: "..." }` message.
- Extensive logging for debugging (see `server.js`).
- If an endpoint is unavailable or the source site changes, errors are returned with details for troubleshooting.


## Demo
Launch the interactive demo at:
```
http://localhost:3000/demo
```
or on production:
```
https://bo-ma-api.vercel.app/demo
```
Try all endpoints visually and view formatted results. The demo uses AJAX to fetch and display live API data, including historical bulletins.


## Dependencies
- express
- axios
- cors
- pdf-parse
- jsdom
- pdf2pic


## Contributing
Pull requests and issues are welcome!
1. Fork the repo and create your branch.
2. Follow code style and add comments for new features.
3. Test endpoints locally before submitting.
4. Document new endpoints and update the demo if needed.
5. Open a PR with a clear description.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
Created by [@Mounseflit](https://github.com/Mounseflit)
