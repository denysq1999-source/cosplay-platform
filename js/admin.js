import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnS9-bQngWjNxM1rKz_qRbrQopSd1aAqA",
  authDomain: "cosplay-platform.firebaseapp.com",
  projectId: "cosplay-platform",
  storageBucket: "cosplay-platform.firebasestorage.app",
  messagingSenderId: "524210919675",
  appId: "1:524210919675:web:929740053092247656f85e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "denysq1999@gmail.com";

let albumPages = [];
let editingIndex = -1;

// ... (keep existing dict, updateLangUI, auth checks, background functions as before)

// Add album management
async function loadAlbum() {
  try {
    const snap = await getDoc(doc(db, "settings", "album"));
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("album-title").value = data.title || "";
      document.getElementById("album-owner").value = data.owner || "";
      albumPages = data.pages || [];
    }
    renderPagesList();
  } catch (err) {
    console.error(err);
  }
}

function renderPagesList() {
  const list = document.getElementById("pages-list");
  if (!list) return;
  list.innerHTML = albumPages.length ? albumPages.map((p, i) => `
    <div style="background:#1e1e1e; padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${p.title || "Без назви"}</strong><br>
        <small style="color:#aaa;">${p.series || ""} · ${p.cosplayer || ""}</small>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="admin-btn" onclick="editPage(${i})" style="padding:6px 10px; font-size:12px;">Ред.</button>
        <button class="admin-btn danger" onclick="deletePage(${i})" style="padding:6px 10px; font-size:12px;">Вид.</button>
      </div>
    </div>
  `).join("") : "<p style=\"color:#666;\">Немає сторінок</p>";
}

window.editPage = (i) => {
  const p = albumPages[i];
  document.getElementById("page-title").value = p.title || "";
  document.getElementById("page-series").value = p.series || "";
  document.getElementById("page-cosplayer").value = p.cosplayer || "";
  document.getElementById("page-tags").value = (p.tags || []).join(", ");
  document.getElementById("page-url").value = p.src || "";
  editingIndex = i;
  document.getElementById("btn-add-page").style.display = "none";
  document.getElementById("btn-update-page").style.display = "inline-block";
  document.getElementById("btn-cancel-edit").style.display = "inline-block";
};

window.deletePage = (i) => {
  if (confirm("Видалити цю сторінку?")) {
    albumPages.splice(i, 1);
    renderPagesList();
  }
};

document.getElementById("btn-add-page")?.addEventListener("click", () => {
  const page = {
    id: "p" + Date.now(),
    title: document.getElementById("page-title").value.trim(),
    series: document.getElementById("page-series").value.trim(),
    cosplayer: document.getElementById("page-cosplayer").value.trim(),
    tags: document.getElementById("page-tags").value.split(",").map(t => t.trim()).filter(Boolean),
    src: document.getElementById("page-url").value.trim(),
    likes: 0
  };
  if (!page.title) return alert("Вкажи назву");
  albumPages.push(page);
  renderPagesList();
  clearPageForm();
});

document.getElementById("btn-update-page")?.addEventListener("click", () => {
  if (editingIndex < 0) return;
  albumPages[editingIndex] = {
    ...albumPages[editingIndex],
    title: document.getElementById("page-title").value.trim(),
    series: document.getElementById("page-series").value.trim(),
    cosplayer: document.getElementById("page-cosplayer").value.trim(),
    tags: document.getElementById("page-tags").value.split(",").map(t => t.trim()).filter(Boolean),
    src: document.getElementById("page-url").value.trim()
  };
  renderPagesList();
  clearPageForm();
});

document.getElementById("btn-cancel-edit")?.addEventListener("click", clearPageForm);

function clearPageForm() {
  ["page-title","page-series","page-cosplayer","page-tags","page-url"].forEach(id => document.getElementById(id).value = "");
  editingIndex = -1;
  document.getElementById("btn-add-page").style.display = "inline-block";
  document.getElementById("btn-update-page").style.display = "none";
  document.getElementById("btn-cancel-edit").style.display = "none";
}

document.getElementById("btn-save-album")?.addEventListener("click", async () => {
  const status = document.getElementById("album-status");
  try {
    await setDoc(doc(db, "settings", "album"), {
      title: document.getElementById("album-title").value.trim() || "Альбом косплеєра",
      owner: document.getElementById("album-owner").value.trim() || "Косплеєр",
      year: new Date().getFullYear().toString(),
      pages: albumPages
    });
    status.textContent = "Альбом збережено";
    status.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    status.textContent = "Помилка збереження";
    status.style.color = "#d93025";
  }
});

document.getElementById("btn-delete-album")?.addEventListener("click", async () => {
  if (!confirm("Видалити весь альбом?")) return;
  try {
    await deleteDoc(doc(db, "settings", "album"));
    albumPages = [];
    document.getElementById("album-title").value = "";
    document.getElementById("album-owner").value = "";
    renderPagesList();
    document.getElementById("album-status").textContent = "Альбом видалено";
  } catch (err) {
    console.error(err);
  }
});

// Call loadAlbum on auth success
// (add to existing onAuthStateChanged after loadAllSettings())
