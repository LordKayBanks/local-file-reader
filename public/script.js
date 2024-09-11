const directoryList = document.getElementById('directory-list');
const fileContent = document.getElementById('file-content');
const breadcrumb = document.getElementById('breadcrumb');

let currentPath = '';

// Fetch directory content and display it
function fetchDirectory(path = '') {
   currentPath = path;
   document.getElementById('currentPath-folderForm').value = currentPath;
   document.getElementById('currentPath-uploadForm').value = currentPath;
   fetch(`/api/content?path=${path}`)
      .then((response) => response.json())
      .then((data) => {
         displayDirectory(data);
         updateBreadcrumb();
      });
}

// Display the directory list
function displayDirectory(data) {
   directoryList.innerHTML = '';
   fileContent.innerHTML = ''; // Clear file content when navigating directories

   data.forEach((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = item.name;
      link.href = '#';

      if (item.isDirectory) {
         link.onclick = (e) => {
            e.preventDefault();
            directoryList.classList.remove('inactive');
            fetchDirectory(`${currentPath}/${item.name}`);
         };
      } else {
         link.onclick = (e) => {
            e.preventDefault();
            directoryList.classList.add('inactive');
            fetchFile(`${currentPath}/${item.name}`);
         };
      }

      li.appendChild(link);
      directoryList.appendChild(li);
   });
}

// Fetch and display file content
function fetchFile(filePath) {
   fetch(`/api/file?path=${filePath}`)
      .then((response) => response.text())
      .then((data) => {
         fileContent.innerHTML = `<div>${data}</div>`;
      });
}

// Update breadcrumb navigation
function updateBreadcrumb() {
   breadcrumb.innerHTML = '<a href="/">Home</a>';
   const parts = currentPath.split('/').filter((part) => part !== '');
   let path = '';

   parts.forEach((part, index) => {
      path += (index === 0 ? '' : '/') + part;
      const separator = document.createElement('span');
      separator.textContent = '>';
      separator.classList.add('separator');
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = part;
      a.onclick = (e) => {
         e.preventDefault();
         directoryList.classList.remove('inactive');
         fetchDirectory(path);
      };
      breadcrumb.appendChild(separator);
      breadcrumb.appendChild(a);
   });

   if (!parts.length) breadcrumb.innerHTML = '<a href="/">Home</a>';
}

// Initial load
fetchDirectory();
