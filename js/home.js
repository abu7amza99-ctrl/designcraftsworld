/* home.js - معدل لتوحيد مظهر الشريط العلوي واللوحة الجانبية
   + دعم نظام المجلدات دون حذف النظام القديم
*/

/* ============================
   فتح/غلق اللوحة الجانبية
   ============================ */
const menuBtn = document.getElementById("menuBtn");
const sidePanel = document.getElementById("sidePanel");
const closePanel = document.getElementById("closePanel");

if (menuBtn) menuBtn.addEventListener("click", () => sidePanel.classList.add("open"));
if (closePanel) closePanel.addEventListener("click", () => sidePanel.classList.remove("open"));

/* ============================
   باقي كود الصفحة الأصلي
   ============================ */

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.querySelector('.lightbox-close');
const downloadBtn = document.getElementById('downloadBtn');

let IMAGES = [];
let FOLDERS = [];

/* ============================
   تحميل JSON (صور + مجلدات)
   ============================ */
async function fetchImagesJson() {
  const url = '../assets/images.json';
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = await res.json();

    let images = [];
    if (Array.isArray(j.images)) {
      images = j.images.map(it =>
        typeof it === 'string' ? { name: it, file: it, isFolder: false } : it
      );
    }

    let folders = [];
    if (Array.isArray(j.folders)) {
      folders = j.folders.map(name => ({ name, isFolder: true }));
    }

    return { images, folders };
  } catch (err) {
    console.error('❌ فشل تحميل images.json', err);
    return { images: [], folders: [] };
  }
}

/* ============================
   بطاقة مجلد
   ============================ */
function createFolderCard(folderObj) {
  const div = document.createElement('div');
  div.className = 'gallery-folder';
  div.textContent = folderObj.name;

  div.style.cursor = 'pointer';
  div.style.padding = '15px';
  div.style.background = '#eee';
  div.style.borderRadius = '10px';
  div.style.textAlign = 'center';
  div.style.fontSize = '20px';
  div.style.fontWeight = 'bold';

  div.addEventListener('click', () => {
    openFolder(folderObj.name);
  });

  return div;
}

/* ============================
   بطاقة صورة (قديم)
   ============================ */
function createImageCard(imgObj) {
  const safeFile = encodeURIComponent(imgObj.file).replace(/%25/g, '%');
  const imgPath = `../assets/home/${safeFile}`;

  const a = document.createElement('a');
  a.href = imgPath;
  a.className = 'gallery-item';
  a.setAttribute('data-name', imgObj.name || '');

  const image = document.createElement('img');
  image.src = imgPath;
  image.alt = imgObj.name || '';
  a.appendChild(image);

  a.addEventListener('click', (e) => {
    e.preventDefault();
    openLightbox(imgPath, imgObj.file, imgObj.name);
  });

  return a;
}

/* ============================
   عرض الشبكة (صور + مجلدات)
   ============================ */
function renderGallery(arr) {
  gallery.innerHTML = '';
  if (!Array.isArray(arr) || arr.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'لا توجد نتائج';
    p.style.color = '#000';
    p.style.background = '#fff';
    p.style.padding = '10px';
    p.style.borderRadius = '8px';
    gallery.appendChild(p);
    return;
  }

  const frag = document.createDocumentFragment();
  arr.forEach(item => {
    const card = item.isFolder ? createFolderCard(item) : createImageCard(item);
    frag.appendChild(card);
  });
  gallery.appendChild(frag);
}

/* ============================
   فتح المجلد وعرض صوره تلقائيًا
   ============================ */
async function openFolder(folderName) {
  const folderPath = `../assets/home/${folderName}/`;

  try {
    const res = await fetch(folderPath);
    const html = await res.text();

    const files = [...html.matchAll(/href="([^"]+\.(jpg|jpeg|png|webp))"/gi)]
      .map(m => m[1]);

    const images = files.map(f => ({
      file: `${folderName}/${f}`,
      name: f,
      isFolder: false
    }));

    renderGallery(images);
  } catch (err) {
    console.error("❌ فشل فتح المجلد:", err);
  }
}

/* ============================
   نظام الـ Lightbox (قديم)
   ============================ */
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

/* ============================
   بدء الصفحة
   ============================ */
(async function init() {
  try {
    const data = await fetchImagesJson();
    IMAGES = data.images;
    FOLDERS = data.folders;

    const all = [...FOLDERS, ...IMAGES];
    renderGallery(all);

  } catch (err) {
    gallery.innerHTML = '<p style="padding:12px;background:#fff;color:#000;border-radius:8px">فشل تحميل قائمة الصور.</p>';
  }
})();

/* ============================
   البحث الذكي (صور + مجلدات)
   ============================ */
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const q = (e.target.value || '').trim().toLowerCase();

    const all = [...FOLDERS, ...IMAGES];

    if (!q) {
      renderGallery(all);
      return;
    }

    const filtered = all.filter(it =>
      (it.name || '').toLowerCase().includes(q)
    );

    renderGallery(filtered);
  });
}
