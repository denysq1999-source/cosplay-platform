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
    settings_title: "Налаштування сайту",
    instagram_size_label: "Instagram-розмір зображення",
    size_square: "Квадрат 1:1 (1080×1080)",
    size_portrait: "Портрет 4:5 (1080×1350)",
    size_landscape: "Ландшафт 1.91:1 (1080×566)",
    size_label: "Розмір",
    size_full: "Full HD (1920)",
    size_hd: "HD (1280)",
    size_medium: "Середній (800)",
    drive_url_label: "Посилання на зображення з Google Диска",
    drive_url_placeholder: "https://drive.google.com/file/d/...",
    add_photo_btn: "Додати фото до вибраного альбому",
    edit_btn: "Редагувати",
    delete_btn: "Видалити",
    publish_btn: "Опублікувати",
    bg_guest_label: "Фон до входу",
    bg_user_label: "Фон після входу",
    admin_bg_label: "Зображення в адмінці",
    set_btn: "Встановити",
    empty_text_label: "Текст, коли галерея порожня",
    site_title_label: "Назва сайту (в шапці)",
    shadow_color_label: "Колір тіні тексту",
    primary_btn_color: "Колір основних кнопок (Адмінка)",
    secondary_btn_color: "Колір звичайних кнопок",
    google_btn_color: "Колір кнопки Google",
    btn_text_color: "Колір тексту кнопок",
    save_btn: "Зберегти все",
    reset_btn: "Скинути кольори",
    checking_access: "Перевірка доступу...",
    access_denied: "Доступ заборонено. Перенаправлення..."
  },
  en: {
    admin_title: "Admin Panel",
    back_btn: "← Back to Gallery",
    albums_btn: "Albums",
    settings_btn: "Site Settings",
    settings_title: "Site Settings",
    instagram_size_label: "Instagram image size",
    size_square: "Square 1:1 (1080×1080)",
    size_portrait: "Portrait 4:5 (1080×1350)",
    size_landscape: "Landscape 1.91:1 (1080×566)",
    size_label: "Size",
    size_full: "Full HD (1920)",
    size_hd: "HD (1280)",
    size_medium: "Medium (800)",
    drive_url_label: "Google Drive image URL",
    drive_url_placeholder: "https://drive.google.com/file/d/...",
    add_photo_btn: "Add photo to selected album",
    edit_btn: "Edit",
    delete_btn: "Delete",
    publish_btn: "Publish",
    bg_guest_label: "Background before login",
    bg_user_label: "Background after login",
    admin_bg_label: "Admin panel image",
    set_btn: "Set",
    empty_text_label: "Text when gallery is empty",
    site_title_label: "Site title (in header)",
    shadow_color_label: "Text shadow color",
    primary_btn_color: "Primary buttons color (Admin)",
    secondary_btn_color: "Secondary buttons color",
    google_btn_color: "Google button color",
    btn_text_color: "Button text color",
    save_btn: "Save all",
    reset_btn: "Reset colors",
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
const settingsStatus = document.getElementById("settings-status");

onAuthStateChanged(auth, (user) => {
  if (!user || user.email?.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    statusEl.textContent = dict[currentLang].access_denied;
    setTimeout(() => { window.location.href = "index.html"; }, 1200);
    return;
  }

  statusEl.classList.add("hidden");
  adminContent.classList.remove("hidden");
  loadAllSettings();
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

async function loadAllSettings() {
  try {
    // Backgrounds
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
      applyAdminBackground(adminSnap.data().fileId, adminSnap.data().size);
    }

    // Texts
    const emptySnap = await getDoc(doc(db, "settings", "empty_text"));
    if (emptySnap.exists() && emptySnap.data().text) {
      document.getElementById("empty-text-input").value = emptySnap.data().text;
    }

    const titleSnap = await getDoc(doc(db, "settings", "site_title"));
    if (titleSnap.exists()) {
      if (titleSnap.data().title) document.getElementById("site-title-input").value = titleSnap.data().title;
      if (titleSnap.data().shadowColor) document.getElementById("shadow-color").value = titleSnap.data().shadowColor;
    }

    // Colors
    const colorsSnap = await getDoc(doc(db, "settings", "button_colors"));
    if (colorsSnap.exists()) {
      const data = colorsSnap.data();
      if (data.primary) document.getElementById("primary-color").value = data.primary;
      if (data.secondary) document.getElementById("secondary-color").value = data.secondary;
      if (data.google) document.getElementById("google-color").value = data.google;
      if (data.textColor) document.getElementById("btn-text-color").value = data.textColor;
    }
  } catch (err) {
    console.error(err);
  }
}

function applyAdminBackground(fileId, size = "w1920") {
  if (fileId) {
    const url = `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
    document.body.style.backgroundImage = `url('${url}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  }
}

async function setBackground(type) {
  const map = {
    guest: { input: "bg-guest-url", preview: "preview-guest", size: "size-guest", doc: "background_guest" },
    user: { input: "bg-user-url", preview: "preview-user", size: "size-user", doc: "background_user" },
    admin: { input: "bg-admin-url", preview: "preview-admin", size: "size-admin", doc: "background_admin" }
  };

  const cfg = map[type];
  if (!cfg) return;

  const url = document.getElementById(cfg.input)?.value.trim();
  const size = document.getElementById(cfg.size)?.value || "w1920";

  if (!url) {
    settingsStatus.textContent = "Вкажи посилання";
    settingsStatus.style.color = "#d93025";
    return;
  }

  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) {
    settingsStatus.textContent = "Невірне посилання Google Drive";
    settingsStatus.style.color = "#d93025";
    return;
  }

  try {
    await setDoc(doc(db, "settings", cfg.doc), { url, fileId, size });
    setPreview(cfg.preview, fileId, size);
    if (type === "admin") applyAdminBackground(fileId, size);
    settingsStatus.textContent = "Збережено";
    settingsStatus.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    settingsStatus.textContent = "Помилка збереження";
    settingsStatus.style.color = "#d93025";
  }
}

async function deleteBackground(type) {
  const map = {
    guest: { input: "bg-guest-url", preview: "preview-guest", doc: "background_guest" },
    user: { input: "bg-user-url", preview: "preview-user", doc: "background_user" },
    admin: { input: "bg-admin-url", preview: "preview-admin", doc: "background_admin" }
  };

  const cfg = map[type];
  if (!cfg) return;

  try {
    await deleteDoc(doc(db, "settings", cfg.doc));
    document.getElementById(cfg.input).value = "";
    setPreview(cfg.preview, null);
    if (type === "admin") document.body.style.backgroundImage = "none";
    settingsStatus.textContent = "Видалено";
    settingsStatus.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    settingsStatus.textContent = "Помилка видалення";
    settingsStatus.style.color = "#d93025";
  }
}

document.getElementById("btn-save-settings")?.addEventListener("click", async () => {
  const title = document.getElementById("site-title-input")?.value.trim();
  const shadowColor = document.getElementById("shadow-color")?.value || "#000000";
  const emptyText = document.getElementById("empty-text-input")?.value.trim();
  const primary = document.getElementById("primary-color")?.value || "#9c27b0";
  const secondary = document.getElementById("secondary-color")?.value || "#222222";
  const google = document.getElementById("google-color")?.value || "#4285F4";
  const textColor = document.getElementById("btn-text-color")?.value || "#ffffff";

  try {
    if (title) await setDoc(doc(db, "settings", "site_title"), { title, shadowColor });
    if (emptyText) await setDoc(doc(db, "settings", "empty_text"), { text: emptyText });
    await setDoc(doc(db, "settings", "button_colors"), { primary, secondary, google, textColor });

    settingsStatus.textContent = "Збережено";
    settingsStatus.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    settingsStatus.textContent = "Помилка збереження";
    settingsStatus.style.color = "#d93025";
  }
});

document.getElementById("btn-reset-settings")?.addEventListener("click", async () => {
  try {
    await deleteDoc(doc(db, "settings", "button_colors"));
    document.getElementById("primary-color").value = "#9c27b0";
    document.getElementById("secondary-color").value = "#222222";
    document.getElementById("google-color").value = "#4285F4";
    document.getElementById("btn-text-color").value = "#ffffff";
    settingsStatus.textContent = "Кольори скинуто";
    settingsStatus.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    settingsStatus.textContent = "Помилка скидання";
    settingsStatus.style.color = "#d93025";
  }
});

document.getElementById("btn-set-guest")?.addEventListener("click", () => setBackground("guest"));
document.getElementById("btn-set-user")?.addEventListener("click", () => setBackground("user"));
document.getElementById("btn-set-admin")?.addEventListener("click", () => setBackground("admin"));
document.getElementById("btn-del-guest")?.addEventListener("click", () => deleteBackground("guest"));
document.getElementById("btn-del-user")?.addEventListener("click", () => deleteBackground("user"));
document.getElementById("btn-del-admin")?.addEventListener("click", () => deleteBackground("admin"));

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
