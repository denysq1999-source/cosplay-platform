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

const dict = {
  uk: {
    admin_title: "Панель адміністратора",
    back_btn: "← На галерею",
    albums_btn: "Альбоми",
    settings_btn: "Налаштування сайту",
    checking_access: "Перевірка доступу...",
    access_denied: "Доступ заборонено. Перенаправлення..."
  },
  en: {
    admin_title: "Admin Panel",
    back_btn: "← Back to Gallery",
    albums_btn: "Albums",
    settings_btn: "Site Settings",
    checking_access: "Checking access...",
    access_denied: "Access denied. Redirecting..."
  }
};

let currentLang = localStorage.getItem("appLang") || "uk";
let albumPages = [];
let editingIndex = -1;

function updateLangUI() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[currentLang][key]) el.textContent = dict[currentLang][key];
  });
  document.getElementById("lang-uk")?.classList.toggle("active", currentLang === "uk");
  document.getElementById("lang-en")?.classList.toggle("active", currentLang === "en");
  const langSwitcher = document.querySelector(".lang-switcher");
  if (langSwitcher) langSwitcher.dataset.lang = currentLang;
}

document.getElementById("lang-uk")?.addEventListener("click", () => {
  currentLang = "uk";
  localStorage.setItem("appLang", "uk");
  updateLangUI();
});
document.getElementById("lang-en")?.addEventListener("click", () => {
  currentLang = "en";
  localStorage.setItem("appLang", "en");
  updateLangUI();
});

updateLangUI();

const adminContent = document.getElementById("admin-content");
const statusEl = document.getElementById("status");
const albumsSection = document.getElementById("albums-section");
const btnAlbums = document.getElementById("btn-albums");
const settingsSection = document.getElementById("settings-section");
const btnSettings = document.getElementById("btn-settings");

onAuthStateChanged(auth, (user) => {
  if (!user || user.email?.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    statusEl.textContent = dict[currentLang].access_denied;
    setTimeout(() => { window.location.href = "index.html"; }, 1200);
    return;
  }

  statusEl.classList.add("hidden");
  adminContent.classList.remove("hidden");
  loadAllSettings();
  loadAlbum();
});

btnAlbums?.addEventListener("click", () => {
  albumsSection?.classList.toggle("hidden");
  settingsSection?.classList.add("hidden");
});

btnSettings?.addEventListener("click", () => {
  settingsSection?.classList.toggle("hidden");
  albumsSection?.classList.add("hidden");
});

function extractGoogleDriveFileId(url) {
  if (!url) return null;
  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/];
  for (const p of patterns) {
    const m = url.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

function setPreview(elId, fileId, size = "w800") {
  const el = document.getElementById(elId);
  if (!el) return;
  if (fileId) {
    el.style.backgroundImage = `url('https://drive.google.com/thumbnail?id=${fileId}&sz=${size}')`;
  } else {
    el.style.backgroundImage = "none";
  }
}

function applyAdminButtonColors() {
  const root = document.documentElement;
  root.style.setProperty("--btn-primary", document.getElementById("primary-color")?.value || "#9c27b0");
  root.style.setProperty("--btn-secondary", document.getElementById("secondary-color")?.value || "#222222");
  root.style.setProperty("--btn-google", document.getElementById("google-color")?.value || "#4285F4");
  root.style.setProperty("--btn-text", document.getElementById("btn-text-color")?.value || "#ffffff");
}

["primary-color", "secondary-color", "google-color", "btn-text-color"].forEach(id => {
  document.getElementById(id)?.addEventListener("input", applyAdminButtonColors);
});

async function loadAllSettings() {
  try {
    const guestSnap = await getDoc(doc(db, "settings", "background_guest"));
    if (guestSnap.exists() && guestSnap.data().fileId) {
      document.getElementById("bg-guest-url").value = guestSnap.data().url || "";
      if (guestSnap.data().size) document.getElementById("size-guest").value = guestSnap.data().size;
      setPreview("preview-guest", guestSnap.data().fileId, guestSnap.data().size || "w800");
    }

    const userSnap = await getDoc(doc(db, "settings", "background_user"));
    if (userSnap.exists() && userSnap.data().fileId) {
      document.getElementById("bg-user-url").value = userSnap.data().url || "";
      if (userSnap.data().size) document.getElementById("size-user").value = userSnap.data().size;
      setPreview("preview-user", userSnap.data().fileId, userSnap.data().size || "w800");
    }

    const adminSnap = await getDoc(doc(db, "settings", "background_admin"));
    if (adminSnap.exists() && adminSnap.data().fileId) {
      document.getElementById("bg-admin-url").value = adminSnap.data().url || "";
      if (adminSnap.data().size) document.getElementById("size-admin").value = adminSnap.data().size;
      setPreview("preview-admin", adminSnap.data().fileId, adminSnap.data().size || "w800");
    }

    const emptySnap = await getDoc(doc(db, "settings", "empty_text"));
    if (emptySnap.exists() && emptySnap.data().text) {
      document.getElementById("empty-text-input").value = emptySnap.data().text;
    }

    const titleSnap = await getDoc(doc(db, "settings", "site_title"));
    if (titleSnap.exists()) {
      if (titleSnap.data().title) document.getElementById("site-title-input").value = titleSnap.data().title;
      if (titleSnap.data().shadowColor) document.getElementById("shadow-color").value = titleSnap.data().shadowColor;
    }

    const colorsSnap = await getDoc(doc(db, "settings", "button_colors"));
    if (colorsSnap.exists()) {
      const data = colorsSnap.data();
      if (data.primary) document.getElementById("primary-color").value = data.primary;
      if (data.secondary) document.getElementById("secondary-color").value = data.secondary;
      if (data.google) document.getElementById("google-color").value = data.google;
      if (data.textColor) document.getElementById("btn-text-color").value = data.textColor;
    }
    applyAdminButtonColors();
  } catch (err) {
    console.error(err);
  }
}

async function loadAlbum() {
  try {
    const snap = await getDoc(doc(db, "settings", "album"));
    if (snap.exists()) {
      const data = snap.data();
      document.getElementById("album-title").value = data.title || "";
      document.getElementById("album-owner").value = data.owner || "";
      document.getElementById("album-intro-image").value = data.introImage || data.firstPageImage || "";
      albumPages = data.pages || [];
    }
    renderPagesList();
    updateIntroImagePreview();
  } catch (err) {
    console.error(err);
  }
}

function updateIntroImagePreview() {
  const input = document.getElementById("album-intro-image");
  const preview = document.getElementById("album-intro-preview");
  if (!input || !preview) return;
  const raw = input.value.trim();
  const match = raw.match(/drive\\.google\\.com\\/file\\/d\\/([a-zA-Z0-9_-]+)/) || raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const src = raw.includes("drive.google.com") && match
    ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w600`
    : raw;
  if (!src) { preview.removeAttribute("src"); preview.hidden = true; preview.style.display = "none"; return; }
  preview.src = src;
  preview.hidden = false;
  preview.style.display = "block";
  preview.onerror = () => { preview.hidden = true; preview.style.display = "none"; };
}

document.getElementById("album-intro-image")?.addEventListener("input", updateIntroImagePreview);

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

function clearPageForm() {
  ["page-title","page-series","page-cosplayer","page-tags","page-url"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  editingIndex = -1;
  document.getElementById("btn-add-page").style.display = "inline-block";
  document.getElementById("btn-update-page").style.display = "none";
  document.getElementById("btn-cancel-edit").style.display = "none";
}

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

document.getElementById("btn-save-album")?.addEventListener("click", async () => {
  const status = document.getElementById("album-status");
  try {
    await setDoc(doc(db, "settings", "album"), {
      title: document.getElementById("album-title").value.trim() || "Альбом косплеєра",
      owner: document.getElementById("album-owner").value.trim() || "Косплеєр",
      year: new Date().getFullYear().toString(),
      introImage: document.getElementById("album-intro-image").value.trim(),
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
    document.getElementById("album-intro-image").value = "";
    updateIntroImagePreview();
    renderPagesList();
    document.getElementById("album-status").textContent = "Альбом видалено";
  } catch (err) {
    console.error(err);
  }
});

// Background and settings handlers (simplified from previous versions)
document.getElementById("btn-save-settings")?.addEventListener("click", async () => {
  const status = document.getElementById("settings-status");
  try {
    const title = document.getElementById("site-title-input")?.value.trim();
    const shadowColor = document.getElementById("shadow-color")?.value || "#000000";
    const emptyText = document.getElementById("empty-text-input")?.value.trim();
    const primary = document.getElementById("primary-color")?.value || "#9c27b0";
    const secondary = document.getElementById("secondary-color")?.value || "#222222";
    const google = document.getElementById("google-color")?.value || "#4285F4";
    const textColor = document.getElementById("btn-text-color")?.value || "#ffffff";

    if (title) await setDoc(doc(db, "settings", "site_title"), { title, shadowColor });
    if (emptyText) await setDoc(doc(db, "settings", "empty_text"), { text: emptyText });
    await setDoc(doc(db, "settings", "button_colors"), { primary, secondary, google, textColor });

    status.textContent = "Збережено";
    status.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    status.textContent = "Помилка";
    status.style.color = "#d93025";
  }
});

document.getElementById("btn-reset-settings")?.addEventListener("click", async () => {
  try {
    await deleteDoc(doc(db, "settings", "button_colors"));
    document.getElementById("primary-color").value = "#9c27b0";
    document.getElementById("secondary-color").value = "#222222";
    document.getElementById("google-color").value = "#4285F4";
    document.getElementById("btn-text-color").value = "#ffffff";
    applyAdminButtonColors();
    document.getElementById("settings-status").textContent = "Кольори скинуто";
  } catch (err) {
    console.error(err);
  }
});

// Background set/delete (minimal)
["guest", "user", "admin"].forEach(type => {
  document.getElementById(`btn-set-${type}`)?.addEventListener("click", async () => {
    const url = document.getElementById(`bg-${type}-url`)?.value.trim();
    const size = document.getElementById(`size-${type}`)?.value || "w1920";
    const fileId = extractGoogleDriveFileId(url);
    if (!fileId) return alert("Невірне посилання");
    await setDoc(doc(db, "settings", `background_${type}`), { url, fileId, size });
    setPreview(`preview-${type}`, fileId, size);
    alert("Збережено");
  });
  document.getElementById(`btn-del-${type}`)?.addEventListener("click", async () => {
    await deleteDoc(doc(db, "settings", `background_${type}`));
    document.getElementById(`bg-${type}-url`).value = "";
    setPreview(`preview-${type}`, null);
  });
});
