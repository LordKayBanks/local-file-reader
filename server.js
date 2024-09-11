const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const contentDir = path.join(__dirname, 'content');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const storage = multer.memoryStorage();
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
   const currentPath = req.body.currentPath;
   const newFolderName = req.body.newFolderName;
   const folderPath = path.join(contentDir, currentPath || '', newFolderName);
   console.log('folderPath: ', folderPath);
   try {
      fs.mkdirSync(folderPath, { recursive: true });
      res.redirect('/');
      // res.redirect('/?path=' + (req.query.path || ''));
   } catch (err) {
      res.status(500).send('Error creating folder:\n', err);
   }
});

app.post('/upload', upload.single('file'), (req, res) => {
   const file = req.file;
   const currentPath = req.body.currentPath;

   // Ensure the destination directory exists
   const uploadPath = path.join(contentDir, currentPath || '');
   fs.mkdirSync(uploadPath, { recursive: true });
   const filePath = path.join(uploadPath, file.originalname);

   fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
         console.error('Error saving file:', err);
         return res.status(500).send('Error saving file.');
      }

      console.log(`File uploaded to: ${filePath}`);
      res.redirect('/');
   });
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
