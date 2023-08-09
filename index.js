import path from 'path';
import fs from 'fs';
import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';
import http from 'http';
import crypto from 'crypto';
import morgan from 'morgan';
import 'dotenv/config'

// Ensure we have a config
if (!fs.existsSync('.env')) {
    console.error('Please copy the .env.dist file to .env and fill out your details!')
    process.exit(1);
}

const uploadDirectory = process.env.FILES_PATH;
const redirectUrl = process.env.NOT_FOUND_REDIRECT;
let baseUrl = process.env.BASE_URL;
if (baseUrl.endsWith('/')) baseUrl = baseUrl.trimEnd();

// Create uploads directory if it does not exist and local static files should be served
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

const app = express();

// Add middlewares so we can read the key and get the multipart file
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload({safeFileNames: true, preserveExtension: true}));

// Log each request
app.use(morgan('combined'));

app.get('/', (req, res) => {
    if (redirectUrl) {
        res.redirect(redirectUrl);
    } else {
        res.status(404).json({'error': 'not found'})
    }
})

// Any GET link is for files
app.get('*', (req, res) => {
    const url = req.url;
    const filePath = path.resolve(path.join(uploadDirectory, url));
    if (!fs.existsSync(filePath)) {
        if (redirectUrl) {
            res.redirect(redirectUrl);
        } else {
            res.status(404).json({'error': 'not found'})
        }
        return;
    }
    res.sendFile(filePath);
});

// Key middleware
const keyMiddleware = (req, res, next) => {

    let key = null;
    if (req.body.key) {
        key = req.body.key;
    } else if (req.query.key) {
        key = req.query.key;
    }

    // Check if key is registered
    if (key !== process.env.SECRET_KEY) {
        res.status(403).json({'error': 'Access denied'});
        return;
    }

    next();
};

// Upload file
app.post('/upload', keyMiddleware, async (req, res) => {
    // Check if file was uploaded
    if (!req.files || !req.files.file) {
        res.status(400).json({'error': 'No file provided. Make sure you have the "File form name" set as "file"'});
        return;
    }

    const file = req.files.file;
    const fileExtension = path.extname(file.name);

    // Get a random path
    let randomPath = null;
    let randomName = null;
    while (randomName === null) {
        const newName = crypto.randomBytes(Number(process.env.KEY_LENGTH) ?? 30).toString('hex') + fileExtension;
        const uploadPath = path.join(process.env.FILES_PATH ?? 'files/', newName);
        if (!fs.existsSync(uploadPath)) {
            randomName = newName;
            randomPath = uploadPath;
        }
    }

    // Move files
    file.mv(randomPath, err => {
        if (err) return res.status(500).json({'error': err});

        return res.status(200).json({
            success: true,
            data: {
                url: `${baseUrl}/${randomName}`
            }
        });
    });
});

const server = http.createServer(app);
const port = process.env.PORT ?? 3000;
server.listen(port, () => {
    console.info(`Server started: ${baseUrl}!`);
});
