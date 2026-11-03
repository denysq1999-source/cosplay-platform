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
    admin_title:"Панель адміністратора", back_btn:"← На галерею", albums_btn:"Альбоми", settings_btn:"Налаштування сайту",
    checking_access:"Перевірка доступу...", access_denied:"Доступ заборонено. Перенаправлення...",
    album_manage:"Керування альбомом (журнал)", album_name:"Назва альбому", album_title_placeholder:"Альбом косплеєра",
    album_owner:"Власник / нік", owner_placeholder:"Нікнейм косплеєра", page_format:"Формат сторінок журналу",
    ratio_45:"4:5 — портретний (соцмережі)", ratio_34:"3:4 — класичний портретний", ratio_23:"2:3 — вертикальне фото", ratio_11:"1:1 — квадрат", ratio_169:"16:9 — альбомний / широкий",
    format_help:"Розмір обох сторінок і всієї книжки автоматично підлаштується під вибрані пропорції та екран. Самі фотографії не обрізаються.",
    corner_custom_title:"Оформлення куточків фоторамок", corner_enabled:"Увімкнути декор куточків",
    corner_style:"Декор куточків", corner_classic:"Класичний загнутий кутик",
    corner_star:"Зірочка", corner_bookmark:"Закладка", corner_flower:"Квіточка",
    corner_color:"Колір декору", corner_help:"Оформлення застосовується до верхніх кутів фоторамок.",
    corner_preview_label:"Верхні кути фоторамки",
    front_cover:"Зображення лицьової обкладинки журналу (перша сторінка)", image_link_placeholder:"Посилання на зображення або Google Drive",
    front_cover_help:"Фото стане зовнішньою лицьовою обкладинкою журналу — її видно першою, ще до гортання сторінок. Пропорції зображення зберігаються.",
    front_preview:"Попередній перегляд лицьової обкладинки", back_cover:"Зображення задньої обкладинки журналу",
    back_cover_help:"Це буде зовнішня задня обкладинка, яку побачать після перегортання всіх сторінок.", back_preview:"Попередній перегляд задньої обкладинки",
    page_edit_heading:"Додати / редагувати сторінку", look_title_placeholder:"Назва образу", series_placeholder:"Серія",
    cosplayer_placeholder:"Косплеєр", tags_placeholder:"Теги через кому", photo_link_placeholder:"Посилання Google Drive",
    add_page:"Додати сторінку", update_page:"Оновити сторінку", cancel:"Скасувати", save_album:"Зберегти альбом",
    view_album:"Переглянути альбом", delete_album:"Видалити альбом", settings_title:"Налаштування сайту",
    site_title_label:"Назва сайту (в шапці)", site_title_placeholder:"Косплей Галерея", shadow_color_label:"Колір тіні тексту",
    empty_text_label:"Текст, коли галерея порожня", empty_placeholder:"Галерея порожня.", bg_guest_label:"Фон до входу",
    bg_user_label:"Фон після входу", admin_background_label:"Зображення в адмінці", size_label:"Розмір",
    full_hd_1920:"Full HD (1920)", hd_1280:"HD (1280)", medium_800:"Середній (800)",
    set_image:"Встановити", remove_image:"Видалити", primary_button_color:"Колір основних кнопок (Адмінка)",
    secondary_button_color:"Колір звичайних кнопок", google_button_color:"Колір кнопки Google", button_text_color:"Колір тексту кнопок",
    save_all:"Зберегти все", reset_colors:"Скинути кольори", page_title_fallback:"Без назви", edit_short:"Ред.",
    delete_short:"Вид.", no_pages:"Немає сторінок", confirm_delete_page:"Видалити цю сторінку?",
    enter_title:"Вкажи назву", album_saved:"Альбом збережено", save_error:"Помилка збереження",
    confirm_delete_album:"Видалити весь альбом?", album_deleted:"Альбом видалено", saved:"Збережено",
    error:"Помилка", colors_reset:"Кольори скинуто", image_link_needed:"Встав посилання на зображення або Google Drive.",
    background_saved:"Зображення заставки збережено", background_save_error:"Не вдалося зберегти заставку. Перевір права доступу адміністратора.",
    background_delete_error:"Не вдалося видалити заставку."
  },
  en: {
    admin_title:"Admin Panel", back_btn:"← Back to Gallery", albums_btn:"Albums", settings_btn:"Site Settings",
    checking_access:"Checking access...", access_denied:"Access denied. Redirecting...",
    album_manage:"Album management (magazine)", album_name:"Album title", album_title_placeholder:"Cosplayer album",
    album_owner:"Owner / nickname", owner_placeholder:"Cosplayer nickname", page_format:"Magazine page format",
    ratio_45:"4:5 — portrait (social)", ratio_34:"3:4 — classic portrait", ratio_23:"2:3 — vertical photo", ratio_11:"1:1 — square", ratio_169:"16:9 — landscape / widescreen",
    format_help:"Both pages and the full book automatically fit the selected proportions and screen. Photos are never cropped.",
    corner_custom_title:"Photo frame corner decoration", corner_enabled:"Enable corner decoration",
    corner_style:"Corner style", corner_classic:"Classic folded corner", corner_star:"Star",
    corner_bookmark:"Bookmark", corner_flower:"Flower", corner_color:"Decoration color",
    corner_help:"This decoration is applied to the upper corners of the photo frames.",
    corner_preview_label:"Upper photo frame corners",
    front_cover:"Magazine front cover image", image_link_placeholder:"Image URL or Google Drive link",
    front_cover_help:"This image becomes the outside front cover, visible before opening the magazine. Image proportions are preserved.",
    front_preview:"Front cover preview", back_cover:"Magazine back cover image",
    back_cover_help:"This is the outside back cover, shown after turning all pages.", back_preview:"Back cover preview",
    page_edit_heading:"Add / edit a page", look_title_placeholder:"Cosplay / look title", series_placeholder:"Series",
    cosplayer_placeholder:"Cosplayer", tags_placeholder:"Tags separated by commas", photo_link_placeholder:"Google Drive image link",
    add_page:"Add page", update_page:"Update page", cancel:"Cancel", save_album:"Save album",
    view_album:"Preview album", delete_album:"Delete album", settings_title:"Site Settings",
    site_title_label:"Website name (header)", site_title_placeholder:"Cosplay Gallery", shadow_color_label:"Text shadow color",
    empty_text_label:"Text shown when the gallery is empty", empty_placeholder:"Gallery is empty.", bg_guest_label:"Background before login",
    bg_user_label:"Background after login", admin_background_label:"Admin panel background", size_label:"Image size",
    full_hd_1920:"Full HD (1920)", hd_1280:"HD (1280)", medium_800:"Medium (800)",
    set_image:"Apply", remove_image:"Remove", primary_button_color:"Primary button color (Admin)",
    secondary_button_color:"Secondary button color", google_button_color:"Google button color", button_text_color:"Button text color",
    save_all:"Save all settings", reset_colors:"Reset colors", page_title_fallback:"Untitled", edit_short:"Edit",
    delete_short:"Del.", no_pages:"No pages", confirm_delete_page:"Delete this page?",
    enter_title:"Enter a title", album_saved:"Album saved", save_error:"Save error",
    confirm_delete_album:"Delete the entire album?", album_deleted:"Album deleted", saved:"Saved",
    error:"Error", colors_reset:"Colors reset", image_link_needed:"Enter an image URL or Google Drive link.",
    background_saved:"Background image saved", background_save_error:"Could not save the background. Check administrator permissions.",
    background_delete_error:"Could not delete the background."
  }
};

let currentLang = localStorage.getItem("appLang") || "uk";
if (!["uk","en"].includes(currentLang)) currentLang = "uk";
const t = key => dict[currentLang]?.[key] || dict.uk[key] || key;
let albumPages = [];
let editingIndex = -1;

function updateLangUI() {
  document.documentElement.lang = currentLang;
  document.title = currentLang === "en" ? "Admin Panel — Cosplay Gallery" : "Адмінка — Косплей Галерея";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[currentLang][key]) el.textContent = dict[currentLang][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[currentLang][key]) el.placeholder = dict[currentLang][key];
  });
  document.querySelectorAll("[data-i18n-alt]").forEach(el => {
    const key = el.getAttribute("data-i18n-alt");
    if (dict[currentLang][key]) el.alt = dict[currentLang][key];
  });
  document.querySelectorAll("option[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[currentLang][key]) el.textContent = dict[currentLang][key];
  });
  document.getElementById("lang-uk")?.classList.toggle("active", currentLang === "uk");
  document.getElementById("lang-en")?.classList.toggle("active", currentLang === "en");
  const langSwitcher = document.querySelector(".lang-switcher");
  if (langSwitcher) langSwitcher.dataset.lang = currentLang;
  if (typeof renderPagesList === "function") renderPagesList();
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

function resolveBackgroundImage(url, size = "w1920") {
  const raw = (url || "").trim();
  if (!raw) return "";
  const fileId = extractGoogleDriveFileId(raw);
  if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? raw : "";
  } catch {
    return "";
  }
}

function getImageCandidates(source, size = "w1200") {
  const raw = String(source || "").trim();
  if (!raw) return [];
  const fileId = extractGoogleDriveFileId(raw) || (/^[a-zA-Z0-9_-]{20,}$/.test(raw) ? raw : "");
  if (fileId) {
    const id = encodeURIComponent(fileId);
    return [
      `https://drive.google.com/thumbnail?id=${id}&sz=${size}`,
      `https://lh3.googleusercontent.com/d/${id}=w${size.replace("w","")}`,
      `https://drive.google.com/uc?export=view&id=${id}`
    ];
  }
  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? [raw] : [];
  } catch {
    return [];
  }
}

function setPreview(elId, source, size = "w800") {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = "";
  el.style.backgroundImage = "none";
  const candidates = getImageCandidates(source, size);
  if (!candidates.length) return;

  const img = document.createElement("img");
  img.alt = "Background image preview";
  img.style.cssText = "width:100%;height:100%;display:block;object-fit:contain;border-radius:8px;";
  let attempt = 0;
  img.onerror = () => {
    attempt += 1;
    if (attempt < candidates.length) {
      img.src = candidates[attempt];
    } else {
      img.remove();
      const note = document.createElement("span");
      note.textContent = currentLang === "en"
        ? "Image unavailable — check Google Drive sharing access"
        : "Зображення недоступне — перевір доступ до файлу Google Drive";
      note.style.cssText = "display:flex;width:100%;height:100%;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;color:#bbb;font-size:12px;text-align:center;";
      el.appendChild(note);
    }
  };
  img.src = candidates[0];
  el.appendChild(img);
}

function applyAdminBackground(source, size = "w1920") {
  const candidates = getImageCandidates(source, size);
  if (!candidates.length) return;
  const probe = new Image();
  let attempt = 0;
  probe.onload = () => {
    document.body.style.backgroundImage = `url(${JSON.stringify(probe.src)})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";
  };
  probe.onerror = () => {
    attempt += 1;
    if (attempt < candidates.length) probe.src = candidates[attempt];
    else console.warn("Admin background could not be loaded. Check image URL and sharing permissions.");
  };
  probe.src = candidates[0];
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
    if (guestSnap.exists()) {
      const bgData = guestSnap.data();
      const bgUrl = bgData.url || bgData.imageUrl || "";
      document.getElementById("bg-guest-url").value = bgUrl;
      if (bgData.size) document.getElementById("size-guest").value = bgData.size;
      setPreview("preview-guest", bgData.fileId || bgUrl, bgData.size || "w800");
    }

    const userSnap = await getDoc(doc(db, "settings", "background_user"));
    if (userSnap.exists()) {
      const bgData = userSnap.data();
      const bgUrl = bgData.url || bgData.imageUrl || "";
      document.getElementById("bg-user-url").value = bgUrl;
      if (bgData.size) document.getElementById("size-user").value = bgData.size;
      setPreview("preview-user", bgData.fileId || bgUrl, bgData.size || "w800");
    }

    const adminSnap = await getDoc(doc(db, "settings", "background_admin"));
    if (adminSnap.exists()) {
      const bgData = adminSnap.data();
      const bgUrl = bgData.url || bgData.imageUrl || "";
      document.getElementById("bg-admin-url").value = bgUrl;
      if (bgData.size) document.getElementById("size-admin").value = bgData.size;
      setPreview("preview-admin", bgData.fileId || bgUrl, bgData.size || "w800");
      applyAdminBackground(bgData.fileId || bgUrl, bgData.size || "w1920");
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
      document.getElementById("album-page-format").value = data.pageFormat || "4:5";
      document.getElementById("album-corner-style").value = ["classic","star","bookmark","flower"].includes(data.cornerStyle) ? data.cornerStyle : "classic";
      document.getElementById("album-corner-color").value = /^#[0-9a-fA-F]{6}$/.test(data.cornerColor || "") ? data.cornerColor : "#cdbfa8";
      document.getElementById("album-corner-enabled").checked = data.cornerDecorEnabled !== false;
      document.getElementById("album-intro-image").value = data.coverImage || data.introImage || data.firstPageImage || "";
      document.getElementById("album-back-cover-image").value = data.backCoverImage || data.backCover || "";
      albumPages = data.pages || [];
    }
    renderPagesList();
    updateIntroImagePreview();
    updateBackCoverPreview();
    updateCornerPreview();
  } catch (err) {
    console.error(err);
  }
}

function updateCornerPreview() {
  const style = document.getElementById("album-corner-style")?.value || "classic";
  const color = document.getElementById("album-corner-color")?.value || "#cdbfa8";
  const enabled = document.getElementById("album-corner-enabled")?.checked !== false;
  const left = document.getElementById("corner-preview-left");
  const right = document.getElementById("corner-preview-right");
  [left, right].forEach((mark, index) => {
    if (!mark) return;
    mark.style.display = enabled ? "block" : "none";
    mark.style.background = "none";
    mark.style.color = color;
    mark.style.clipPath = "none";
    mark.style.fontSize = "27px";
    mark.style.lineHeight = "30px";
    mark.style.textAlign = "center";
    mark.textContent = "";
    if (!enabled) return;
    if (style === "classic") {
      mark.style.background = color;
      mark.style.clipPath = index === 0
        ? "polygon(0 0,100% 0,0 100%)"
        : "polygon(0 0,100% 0,100% 100%)";
    } else if (style === "bookmark") {
      mark.style.background = color;
      mark.style.width = "22px";
      mark.style.height = "34px";
      mark.style.clipPath = "polygon(0 0,100% 0,100% 100%,50% 76%,0 100%)";
    } else {
      mark.textContent = style === "flower" ? "✿" : "★";
      mark.style.color = color;
    }
  });
}
document.getElementById("album-corner-style")?.addEventListener("change", updateCornerPreview);
document.getElementById("album-corner-color")?.addEventListener("input", updateCornerPreview);
document.getElementById("album-corner-enabled")?.addEventListener("change", updateCornerPreview);document.getElementById("album-corner-style")?.addEventListener("change", updateCornerPreview);
document.getElementById("album-corner-color")?.addEventListener("input", updateCornerPreview);

function updateIntroImagePreview() {
  const input = document.getElementById("album-intro-image");
  const preview = document.getElementById("album-intro-preview");
  if (!input || !preview) return;
  const raw = input.value.trim();
  const match = raw.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) || raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
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

function updateBackCoverPreview() {
  const input = document.getElementById("album-back-cover-image");
  const preview = document.getElementById("album-back-cover-preview");
  if (!input || !preview) return;
  const raw = input.value.trim();
  const match = raw.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) || raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const src = raw.includes("drive.google.com") && match
    ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w600`
    : raw;
  if (!src) { preview.removeAttribute("src"); preview.hidden = true; preview.style.display = "none"; return; }
  preview.src = src;
  preview.hidden = false;
  preview.style.display = "block";
  preview.onerror = () => { preview.hidden = true; preview.style.display = "none"; };
}
document.getElementById("album-back-cover-image")?.addEventListener("input", updateBackCoverPreview);

function renderPagesList() {
  const list = document.getElementById("pages-list");
  if (!list) return;
  list.innerHTML = albumPages.length ? albumPages.map((p, i) => `
    <div style="background:#1e1e1e; padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <strong>${p.title || t("page_title_fallback")}</strong><br>
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
  if (confirm(t("confirm_delete_page"))) {
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
  if (!page.title) return alert(t("enter_title"));
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
      pageFormat: document.getElementById("album-page-format").value || "4:5",
      cornerStyle: document.getElementById("album-corner-style").value || "classic",
      cornerColor: document.getElementById("album-corner-color").value || "#cdbfa8",
      cornerDecorEnabled: document.getElementById("album-corner-enabled").checked,
      coverImage: document.getElementById("album-intro-image").value.trim(),
      backCoverImage: document.getElementById("album-back-cover-image").value.trim(),
      pages: albumPages
    });
    status.textContent = t("album_saved");
    status.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    status.textContent = t("save_error");
    status.style.color = "#d93025";
  }
});

document.getElementById("btn-delete-album")?.addEventListener("click", async () => {
  if (!confirm(t("confirm_delete_album"))) return;
  try {
    await deleteDoc(doc(db, "settings", "album"));
    albumPages = [];
    document.getElementById("album-title").value = "";
    document.getElementById("album-owner").value = "";
    document.getElementById("album-corner-style").value = "classic";
    document.getElementById("album-corner-color").value = "#cdbfa8";
    document.getElementById("album-corner-enabled").checked = true;
    updateCornerPreview();
    document.getElementById("album-intro-image").value = "";
    document.getElementById("album-back-cover-image").value = "";
    updateIntroImagePreview();
    updateBackCoverPreview();
    renderPagesList();
    document.getElementById("album-status").textContent = t("album_deleted");
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

    status.textContent = t("saved");
    status.style.color = "#4caf50";
  } catch (err) {
    console.error(err);
    status.textContent = t("error");
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
    document.getElementById("settings-status").textContent = t("colors_reset");
  } catch (err) {
    console.error(err);
  }
});

// Background images: accept Google Drive share links and direct public image URLs.
["guest", "user", "admin"].forEach(type => {
  document.getElementById(`btn-set-${type}`)?.addEventListener("click", async () => {
    const url = document.getElementById(`bg-${type}-url`)?.value.trim() || "";
    const size = document.getElementById(`size-${type}`)?.value || "w1920";
    const imageUrl = resolveBackgroundImage(url, size);
    if (!imageUrl) return alert(t("image_link_needed"));
    const fileId = extractGoogleDriveFileId(url);
    try {
      await setDoc(doc(db, "settings", `background_${type}`), { url, imageUrl, fileId: fileId || "", size });
      setPreview(`preview-${type}`, fileId || url, size);
      if (type === "admin") applyAdminBackground(fileId || url, size);
      alert(t("background_saved"));
    } catch (err) {
      console.error(err);
      alert(t("background_save_error"));
    }
  });
  document.getElementById(`btn-del-${type}`)?.addEventListener("click", async () => {
    try {
      await deleteDoc(doc(db, "settings", `background_${type}`));
      document.getElementById(`bg-${type}-url`).value = "";
      setPreview(`preview-${type}`, null);
    } catch (err) {
      console.error(err);
      alert(t("background_delete_error"));
    }
  });
});
