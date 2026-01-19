# Liposuction Pitch Deck

Power Assisted Liposuction Machine Pitch Deck - Interactive presentation.

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open http://localhost:3000 in your browser

## Deployment to Railway

The project is ready for Railway deployment:

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js project
3. The server will start on the PORT provided by Railway
4. All static files (HTML, CSS, JS, images) will be served correctly

## Project Structure

```
/
├── index.html          # Main HTML file
├── server.js           # Express server for static files
├── package.json        # Node.js dependencies
├── styles/             # CSS files
├── scripts/            # JavaScript files
├── icons/              # Image and media files
└── slides/             # Additional slide HTML files
```

## Requirements

- Node.js >= 18.0.0
- Express.js (for serving static files)
