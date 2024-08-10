const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const { format } = require('date-fns');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const port = 3000;

const server = http.createServer((req, res) => {
    // Log request details
    myEmitter.emit('request', req.url);

    let filePath = path.join(__dirname, 'views', req.url === '/' ? 'index.html' : `${req.url.slice(1)}.html`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            myEmitter.emit('error', err);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Unavailable</h1>');
            return;
        }
        myEmitter.emit('file-read', filePath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// Event handling
myEmitter.on('request', (url) => {
    console.log(`Request made to: ${url}`);
});

myEmitter.on('file-read', (filePath) => {
    console.log(`File read successfully: ${filePath}`);
});

myEmitter.on('error', (err) => {
    console.error(`Error occurred: ${err.message}`);
    const logFile = path.join(__dirname, 'logs', `${format(new Date(), 'yyyy-MM-dd')}.log`);
    fs.appendFile(logFile, `${new Date().toISOString()} - ERROR: ${err.message}\n`, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
});
