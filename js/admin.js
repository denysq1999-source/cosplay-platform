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
    instagram_size_label: "Instagram-розмір зображення",
    size_square: "Квадрат 1:1 (1080×1080)",
    size_portrait: "Портрет 4:5 (1080×1350)",
    size_landscape: "Ландшафт 1.91:1 (1080×566)",
    drive_url_label: "Посилання на зображення з Google Диска",
    drive_url_placeholder: "https://drive.google.com/file/d/...",
    add_photo_btn: "Додати фото до вибраного альбому",
    edit_btn: "Редагувати",
    delete_btn: "Видалити",
    publish_btn: "Опублікувати",
    background_btn: "Фон головної",
    bg_guest_label: "Фон до входу",
    bg_user_label: "Фон після входу",
    set_btn: "Встановити",
    checking_access: "Перевірка доступу...",
    access_denied: "Доступ заборонено. Перенаправлення..."
  },
  en: {
    admin_title: "Admin Panel",
    back_btn: "← Back to Gallery",
    albums_btn: "Albums",
    instagram_size_label: "Instagram image size",
    size_square: "Square 1:1 (1080×1080)",
    size_portrait: "Portrait 4:5 (1080×1350)",
    size_landscape: "Landscape 1.91:1 (1080×566)",
    drive_url_label: "Google Drive image URL",
    drive_url_placeholder: "https://drive.google.com/file/d/...",
    add_photo_btn: "Add photo to selected album",
    edit_btn: "Edit",
    delete_btn: "Delete",
    publish_btn: "Publish",
    background_btn: "Main background",
    bg_guest_label: "Background before login",
    bg_user_label: "Background after login",
    set_btn: "Set",
    checking_access: "Checking access...",
    access_denied: "Access denied. Redirecting..."
  }
};

let currentLang = localStorage.getItem("appLang") || "uk";

function updateLangUI() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[currentLang][key]) el.textContent = dict[currentLang][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[currentLang][key]) el.placeholder = dict[currentLang][key];
  });
  document.getElementById("lang-uk")?.classList.toggle("active", currentLang === "uk");
  document.getElementById("lang-en")?.classList.toggle("active", currentLang === "en");
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
const bgSection = document.getElementById("background-section");
const btnBackground = document.getElementById("btn-background");
const bgStatus = document.getElementById("bg-status");

onAuthStateChanged(auth, (user) => {
  if (!user || user.email?.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    statusEl.textContent = dict[currentLang].access_denied;
    setTimeout(() => { window.location.href = "index.html"; }, 1200);
    return;
  }

  statusEl.classList.add("hidden");
  adminContent.classList.remove("hidden");
  loadBackgrounds();
});

btnAlbums?.addEventListener("click", () => {
  albumsSection?.classList.toggle("hidden");
  bgSection?.classList.add("hidden");
});

btnBackground?.addEventListener("click", () => {
  bgSection?.classList.toggle("hidden");
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

function setPreview(elId, fileId) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (fileId) {
    el.style.backgroundImage = `url('https://drive.google.com/thumbnail?id=${fileId}&sz=w800')`;
  } else {
    el.style.backgroundImage = "none";
  }
}

async function loadBackgrounds() {
  try {
    const guestSnap = await getDoc(doc(db, "settings", "background_guest"));
    if (guestSnap.exists() && guestSnap.data().fileId) {
      document.getElementById("bg-guest-url").value = guestSnap.data().url || "";
      setPreview("preview-guest", guestSnap.data().fileId);
    }

    const userSnap = await getDoc(doc(db, "settings", "background_user"));
    if (userSnap.exists() && userSnap.data().fileId) {
      document.getElementById("bg-user-url").value = userSnap.data().url || "";
      setPreview("preview-user", userSnap.data().fileId);
    }
  } catch (err) {
    console.error(err);
  }
}

async function setBackground(type) {
  const inputId = type === "guest" ? "bg-guest-url" : "bg-user-url";
  const previewId = type === "guest" ? "preview-guest" : "preview-user";
  const docId = type === "guest" ? "background_guest" : "background_user";

  const url = document.getElementById(inputId)?.value.trim();
  if (!url) {
    bgStatus.textContent = "Вкажи посилання";
    bgStatus.style.color = "#d93025";
    return;
  }

  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) {
    bgStatus.textContent = "Невірне посилання Google Drive";
    bgStatus.style.color = "#d93025";
    return;
  }

  try {
    await setDoc(doc(db, "settings", docId), { url, fileId });
    setPreview(previewId, fileId);
    bgStatus.textContent = "Збережено";
    bgStatus.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    bgStatus.textContent = "Помилка збереження";
    bgStatus.style.color = "#d93025";
  }
}

async function deleteBackground(type) {
  const inputId = type === "guest" ? "bg-guest-url" : "bg-user-url";
  const previewId = type === "guest" ? "preview-guest" : "preview-user";
  const docId = type === "guest" ? "background_guest" : "background_user";

  try {
    await deleteDoc(doc(db, "settings", docId));
    document.getElementById(inputId).value = "";
    setPreview(previewId, null);
    bgStatus.textContent = "Видалено";
    bgStatus.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    bgStatus.textContent = "Помилка видалення";
    bgStatus.style.color = "#d93025";
  }
}

document.getElementById("btn-set-guest")?.addEventListener("click", () => setBackground("guest"));
document.getElementById("btn-set-user")?.addEventListener("click", () => setBackground("user"));
document.getElementById("btn-del-guest")?.addEventListener("click", () => deleteBackground("guest"));
document.getElementById("btn-del-user")?.addEventListener("click", () => deleteBackground("user"));

document.getElementById("btn-add-photo")?.addEventListener("click", () => {
  const url = document.getElementById("drive-url")?.value || "";
  const size = document.getElementById("instagram-size")?.value || "";
  alert(`Додати фото\nРозмір: ${size}\nURL: ${url || "(не вказано)"}`);
});

document.getElementById("btn-edit")?.addEventListener("click", () => {
  alert("Редагувати — зробимо далі");
});

document.getElementById("btn-delete")?.addEventListener("click", () => {
  alert("Видалити — зробимо далі");
});

document.getElementById("btn-publish")?.addEventListener("click", () => {
  alert("Опублікувати — зробимо далі");
});
