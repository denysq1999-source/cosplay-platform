import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

onAuthStateChanged(auth, (user) => {
  if (!user || user.email?.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    statusEl.textContent = dict[currentLang].access_denied;
    setTimeout(() => { window.location.href = "index.html"; }, 1200);
    return;
  }

  statusEl.classList.add("hidden");
  adminContent.classList.remove("hidden");
});

btnAlbums?.addEventListener("click", () => {
  albumsSection?.classList.toggle("hidden");
});

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
