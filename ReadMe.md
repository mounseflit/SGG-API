
# Bulletin Officiel API

## Overview
This API provides instant access to the latest Moroccan Bulletin Officiel publications in both French and Arabic. It offers endpoints for metadata and full-text extraction from official PDFs, with a modern web demo included.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Demo](#demo)
- [License](#license)

## Installation
```bash

# Install dependencies
npm install

# Start the server (development)
node server.js

```

## Usage
The API runs on:
```
http://localhost:3000
```
You can access endpoints directly or use the interactive demo at `/demo`.

## Features
- Fetch latest Bulletin Officiel metadata (French & Arabic)
- Extract full text from official PDFs (French & Arabic)
- Modern, responsive web demo (`test.html`)
- CORS enabled for easy integration
- Health check endpoint

## API Endpoints
- `GET /api/BO/FR` - Latest French Bulletin metadata
- `GET /api/BO/Text/FR` - Full text of latest French Bulletin
- `GET /api/BO/AR` - Latest Arabic Bulletin metadata
- `GET /api/BO/Text/AR` - Full text of latest Arabic Bulletin
- `GET /api/health` - API health status
- `GET /demo` - Interactive web demo
- `GET /` - API documentation page

## Demo
Launch the interactive demo at:
```
http://localhost:3000/demo
```
Try all endpoints visually and view formatted results.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
Created by [@Mounseflit](https://github.com/Mounseflit)
