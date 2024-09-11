const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const contentDir = path.join(__dirname, 'content');

// Serve static files (CSS, JS, etc.) from the public folder
app.use(express.static(path.join(__dirname, 'public')));
const parseForm = express.urlencoded({ extended: true });

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      // const uploadPath = path.join(contentDir, req.body.currentPath || '');
      const uploadPath = path.join(contentDir, '/subfolder1');
      console.log('1req.body.currentPath: ', req.body.currentPath);
      console.log('1req.body: ', req.body);
      cb(null, uploadPath);
   },
   filename: function (req, file, cb) {
      cb(null, file.originalname);
   },
});
const upload = multer({ storage: storage });

// Get all folders and files in the specified directory
function getDirectoryContent(dir) {
   return fs.readdirSync(dir, { withFileTypes: true }).map((dirent) => {
      return {
         name: dirent.name,
         isDirectory: dirent.isDirectory(),
      };
   });
}

// Route to serve the table of contents
app.get('/api/content', (req, res) => {
   const dir = req.query.path ? path.join(contentDir, req.query.path) : contentDir;
   const content = getDirectoryContent(dir);
   res.json(content);
});

// Route to serve file content
app.get('/api/file', (req, res) => {
   const filePath = path.join(contentDir, req.query.path);
   if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
   } else {
      res.status(404).send('File not found');
   }
});

app.post('/create-folder', async (req, res) => {
   const folderPath = path.join(contentDir, req.body.currentPath || '');

   try {
      await fs.mkdir(folderPath, { recursive: true });
      res.redirect('/');
      // res.redirect('/?path=' + (req.query.path || ''));
   } catch (err) {
      res.status(500).send('Error creating folder');
   }
});
app.post('/upload', parseForm, upload.single('file'), (req, res) => {
   console.log('2req.body.currentPath: ', req.body.currentPath);
   console.log('2req.body: ', req.body);
   res.redirect('/');
   // res.redirect('/?path=' + (req.query.path || ''));
});

// Serve the frontend
app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = 3000;
app.listen(port, () => {
   console.log(`Server running at http://localhost:${port}`);
});
