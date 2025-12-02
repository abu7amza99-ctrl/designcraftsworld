/* home.js - معدل لتوحيد مظهر الشريط العلوي واللوحة الجانبية */

const menuBtn = document.getElementById("menuBtn");
const sidePanel = document.getElementById("sidePanel");
const closePanel = document.getElementById("closePanel");

if (menuBtn) menuBtn.addEventListener("click", () => sidePanel.classList.add("open"));
if (closePanel) closePanel.addEventListener("click", () => sidePanel.classList.remove("open"));

/* ============================ */

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.querySelector('.lightbox-close');
const downloadBtn = document.getElementById('downloadBtn');

let IMAGES = [];

/* =========== تحميل JSON =========== */
async function fetchImagesJson() {
  const url = '../assets/images.json';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();

    let data = [];

    // النظام الجديد (يحتوي مجلدات)
    if (j && Array.isArray(j.items)) {
      data = j.items; 
    }
    // النظام القديم (صور فقط)
    else if (j && Array.isArray(j.images)) {
      data = j.images.map(it => ({ name: it, file: it }));
    }

    console.log(`✅ Loaded ${data.length} items`);
    return data;

  } catch (err) {
    console.error('❌ Error loading images.json', err);
    return [];
  }
}

/* =========== كرت صورة أو مجلد =========== */
function createImageCard(obj) {
  
  /* === إذا كان مجلد === */
  if (obj.type === "folder") {

    const folderDiv = document.createElement("div");
    folderDiv.className = "folder-item";
    folderDiv.textContent = "📁 " + obj.name;

    folderDiv.addEventListener("click", () => {
      openFolder(obj);
    });

    return folderDiv;
  }

  /* === صورة عادية === */
  const safeFile = encodeURIComponent(obj.file).replace(/%25/g, '%');
  const imgPath = `../assets/home/${safeFile}`;

  const a = document.createElement('a');
  a.href = imgPath;
  a.className = 'gallery-item';
  a.setAttribute('data-name', obj.name || '');

  const image = document.createElement('img');
  image.src = imgPath;
  image.alt = obj.name || '';
  a.appendChild(image);

  a.addEventListener('click', (e) => {
    e.preventDefault();
    openLightbox(imgPath, obj.file, obj.name);
  });

  return a;
}

/* =========== فتح مجلد =========== */
function openFolder(folderObj) {
  gallery.innerHTML = "";

  folderObj.files.forEach(file => {
    const item = {
      name: file,
      file: `${folderObj.name}/${file}`,
      type: "file"
    };

    gallery.appendChild(createImageCard(item));
  });
}

/* =========== عرض الصور =========== */
function renderGallery(arr) {
  gallery.innerHTML = '';

  if (!Array.isArray(arr) || arr.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'لا توجد نتائج';
    p.style.cssText = "padding:10px;background:#fff;border-radius:8px;color:#000";
    gallery.appendChild(p);
    return;
  }

  const frag = document.createDocumentFragment();
  arr.forEach(img => frag.appendChild(createImageCard(img)));
  gallery.appendChild(frag);
}

/* =========== Lightbox =========== */
function openLightbox(src, filename, name) {
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
  lightboxImage.src = src;
  lightboxImage.alt = name || filename || '';
  downloadBtn.href = src;
  downloadBtn.download = decodeURIComponent(filename || src.split('/').pop());
  downloadBtn.focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
  lightboxImage.src = '';
}

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

/* =========== INIT =========== */
(async function init(){
  IMAGES = await fetchImagesJson();
  renderGallery(IMAGES);
})();

/* =========== البحث =========== */
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const q = (e.target.value || '').trim().toLowerCase();

    if (!q) {
      renderGallery(IMAGES);
      return;
    }

    const normalizedQuery = q.replace(/[\s_-]+/g, '');

    const filtered = IMAGES.filter(i => {
      const normalizedName = (i.name || '').toLowerCase().replace(/[\s_-]+/g, '');
      return normalizedName.includes(normalizedQuery);
    });

    renderGallery(filtered);
  });
}
