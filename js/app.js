import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs,
  deleteDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const provider = new GoogleAuthProvider();

const ADMIN_EMAIL = "denysq1999@gmail.com";
const REMEMBERED_EMAIL_KEY = "rememberedEmail";
const LEGACY_SAVED_CREDENTIALS_KEY = "savedCredentials";

function readLocalValue(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeLocalValue(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function removeLocalValue(key) {
  try { localStorage.removeItem(key); } catch {}
}

// Older versions stored the password in localStorage. Remove it on upgrade.
removeLocalValue(LEGACY_SAVED_CREDENTIALS_KEY);

document.addEventListener("DOMContentLoaded", () => {
  const dict = {
    uk: {
      site_title: "Косплей Галерея",
      login_btn: "Вхід",
      register_btn: "Реєстрація",
      google_btn: "Увійти через Google",
      logout_btn: "Вийти",
      admin_btn: "Адмінка",
      profile_btn: "Кабінет",
      modal_title_login: "Вхід",
      modal_title_register: "Реєстрація",
      modal_submit_login: "Увійти",
      modal_submit_register: "Зареєструватися",
      email_placeholder: "Email",
      password_placeholder: "Пароль",
      remember_password: "Запам’ятати мене",
      err_invalid: "Невірний email або пароль.",
      err_reg: "Помилка реєстрації. Перевірте дані.",
      err_google: "Не вдалося увійти через Google. Спробуй ще раз.",
      err_google_exists: "Цей email вже зареєстрований через Google. Увійди через Google.",
      err_email_exists: "Цей email вже існує. Спробуй увійти або скинути пароль.",
      delete_btn: "Видалити",
      empty_gallery: "Галерея порожня."
    },
    en: {
      site_title: "Cosplay Gallery",
      login_btn: "Login",
      register_btn: "Register",
      google_btn: "Login with Google",
      logout_btn: "Logout",
      admin_btn: "Admin",
      profile_btn: "Profile",
      modal_title_login: "Login",
      modal_title_register: "Register",
      modal_submit_login: "Login",
      modal_submit_register: "Register",
      email_placeholder: "Email",
      password_placeholder: "Password",
      remember_password: "Remember me",
      err_invalid: "Invalid email or password.",
      err_reg: "Registration error. Check your data.",
      err_google: "Could not sign in with Google. Please try again.",
      err_google_exists: "This email is already registered via Google. Please sign in with Google.",
      err_email_exists: "This email already exists. Try logging in or reset the password.",
      delete_btn: "Delete",
      empty_gallery: "Gallery is empty."
    }
  };

  const savedLang = readLocalValue("appLang");
  let currentLang = ["uk", "en"].includes(savedLang) ? savedLang : "uk";
  let isLoginMode = true;
  let currentUser = null;
  let emptyText = dict[currentLang].empty_gallery;
  let siteTitle = dict[currentLang].site_title;
  let shadowColor = "#000000";

  const modalTitle = document.getElementById("modal-title");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const errorContainer = document.getElementById("error-container");
  const btnAdmin = document.getElementById("btn-admin");
  const galleryEl = document.getElementById("gallery");
  const rememberCheckbox = document.getElementById("remember-password");
  const siteTitleEl = document.querySelector("header h1");
  const langSwitcher = document.querySelector(".lang-switcher");
  const albumPreview = document.getElementById("album-preview");
  const albumShelf = document.getElementById("album-shelf");

  function applyTitleStyle() {
    if (siteTitleEl) {
      siteTitleEl.textContent = siteTitle;
      siteTitleEl.style.textShadow = `0 0 6px ${shadowColor}cc, 0 0 14px ${shadowColor}88`;
    }
  }

  function applyButtonColors(primary, secondary, google, textColor) {
    const root = document.documentElement;
    if (primary) root.style.setProperty("--btn-primary", primary);
    if (secondary) root.style.setProperty("--btn-secondary", secondary);
    if (google) root.style.setProperty("--btn-google", google);
    if (textColor) root.style.setProperty("--btn-text", textColor);
  }

  const updateLangUI = () => {
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[currentLang][key]) el.textContent = dict[currentLang][key];
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[currentLang][key]) el.placeholder = dict[currentLang][key];
    });
    if (modalTitle) modalTitle.textContent = isLoginMode ? dict[currentLang].modal_title_login : dict[currentLang].modal_title_register;
    if (authSubmitBtn) authSubmitBtn.textContent = isLoginMode ? dict[currentLang].modal_submit_login : dict[currentLang].modal_submit_register;
    document.getElementById("lang-uk").classList.toggle("active", currentLang === "uk");
    document.getElementById("lang-en").classList.toggle("active", currentLang === "en");
    if (langSwitcher) langSwitcher.dataset.lang = currentLang;
    applyTitleStyle();
  };

  document.getElementById("lang-uk").addEventListener("click", () => {
    currentLang = "uk";
    writeLocalValue("appLang", "uk");
    updateLangUI();
  });
  document.getElementById("lang-en").addEventListener("click", () => {
    currentLang = "en";
    writeLocalValue("appLang", "en");
    updateLangUI();
  });

  updateLangUI();

  const guestControls = document.getElementById("guest-controls");
  const userControls = document.getElementById("user-controls");
  const appSection = document.getElementById("app-section");
  const btnLogin = document.getElementById("btn-login");
  const btnRegister = document.getElementById("btn-register");
  const btnGoogle = document.getElementById("btn-google");
  const btnLogout = document.getElementById("btn-logout");
  const authModal = document.getElementById("auth-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const authForm = document.getElementById("auth-form");

  function loadRememberedEmail() {
    const emailInput = document.getElementById("auth-email");
    const passwordInput = document.getElementById("auth-password");
    if (emailInput) emailInput.value = readLocalValue(REMEMBERED_EMAIL_KEY) || "";
    if (passwordInput) passwordInput.value = "";
    if (rememberCheckbox) rememberCheckbox.checked = Boolean(readLocalValue(REMEMBERED_EMAIL_KEY));
  }

  const openModal = (mode) => {
    isLoginMode = mode === "login";
    const rememberLabel = rememberCheckbox?.closest("label");
    if (rememberLabel) rememberLabel.hidden = !isLoginMode;
    errorContainer.textContent = "";
    if (mode === "login") loadRememberedEmail();
    else authForm.reset();
    updateLangUI();
    authModal.classList.remove("hidden");
  };

  btnLogin?.addEventListener("click", () => openModal("login"));
  btnRegister?.addEventListener("click", () => openModal("register"));
  closeModalBtn?.addEventListener("click", () => authModal.classList.add("hidden"));
  authModal?.addEventListener("click", (e) => {
    if (e.target === authModal) authModal.classList.add("hidden");
  });

  btnGoogle?.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
      if (authModal) authModal.classList.remove("hidden");
      if (errorContainer) {
        errorContainer.textContent = err.code === "auth/account-exists-with-different-credential"
          ? dict[currentLang].err_google_exists
          : dict[currentLang].err_google;
      }
    }
  });

  authForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorContainer.textContent = "";
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    try {
      if (isLoginMode) {
        const remember = Boolean(rememberCheckbox?.checked);
        await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        if (remember) writeLocalValue(REMEMBERED_EMAIL_KEY, email);
        else removeLocalValue(REMEMBERED_EMAIL_KEY);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      authModal.classList.add("hidden");
    } catch (err) {
      console.error(err);
      let msg = isLoginMode ? dict[currentLang].err_invalid : dict[currentLang].err_reg;
      if (err.code === "auth/account-exists-with-different-credential") {
        msg = dict[currentLang].err_google_exists;
      } else if (err.code === "auth/email-already-in-use") {
        msg = dict[currentLang].err_email_exists;
      }
      errorContainer.textContent = msg;
    }
  });

  btnLogout?.addEventListener("click", async () => {
    try { await signOut(auth); } catch (err) { console.error(err); }
  });

  function normalizeEmail(email) {
    if (!email) return "";
    return String(email).trim().toLowerCase().replace(/\s+/g, "");
  }

  function isAdmin(user) {
    if (!user || !user.email) return false;
    return normalizeEmail(user.email) === normalizeEmail(ADMIN_EMAIL);
  }

  function updateAdminButton(user) {
    if (!btnAdmin) return;
    const show = isAdmin(user);
    btnAdmin.style.display = show ? "inline-block" : "none";
    btnAdmin.classList.toggle("hidden", !show);
  }

  async function applyBackground(isLoggedIn) {
    const docId = isLoggedIn ? "background_user" : "background_guest";
    try {
      const snap = await getDoc(doc(db, "settings", docId));
      if (snap.exists()) {
        const data = snap.data();
        const size = data.size || "w1920";
        const fileId = data.fileId || extractGoogleDriveFileId(data.url);
        const imageUrl = fileId
          ? `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`
          : (data.imageUrl || data.url || "");
        if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
          document.body.style.backgroundImage = `url(${JSON.stringify(imageUrl)})`;
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundPosition = "center";
          document.body.style.backgroundAttachment = "fixed";
          return;
        }
      }
      document.body.style.backgroundImage = "none";
    } catch (err) {
      document.body.style.backgroundImage = "none";
      console.error(err);
    }
  }

  async function loadEmptyText() {
    try {
      const snap = await getDoc(doc(db, "settings", "empty_text"));
      if (snap.exists() && snap.data().text) emptyText = snap.data().text;
    } catch {}
  }

  async function loadSiteTitle() {
    try {
      const snap = await getDoc(doc(db, "settings", "site_title"));
      if (snap.exists()) {
        if (snap.data().title) siteTitle = snap.data().title;
        if (snap.data().shadowColor) shadowColor = snap.data().shadowColor;
        applyTitleStyle();
      }
    } catch {}
  }

  async function loadButtonColors() {
    try {
      const snap = await getDoc(doc(db, "settings", "button_colors"));
      if (snap.exists()) {
        const data = snap.data();
        applyButtonColors(data.primary, data.secondary, data.google, data.textColor);
      }
    } catch {}
  }

  function extractGoogleDriveFileId(url) {
    const raw = String(url || "").trim();
    if (!raw) return null;
    const m = raw.match(/\/d\/([a-zA-Z0-9_-]+)/) || raw.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }

  async function loadAlbumPreview() {
    if (!albumPreview || !albumShelf) return;
    try {
      const settingsSnap = await getDocs(collection(db, "settings"));
      let magazines = settingsSnap.docs
        .filter(item => item.id.startsWith("album_"))
        .map(item => ({ id: item.id, data: item.data() || {} }))
        .sort((a, b) => a.id.localeCompare(b.id));

      // Backward compatibility while the legacy single-album document still exists.
      if (!magazines.length) {
        const legacySnap = await getDoc(doc(db, "settings", "album"));
        if (legacySnap.exists()) magazines = [{ id: "legacy", data: legacySnap.data() || {} }];
      }

      albumShelf.innerHTML = "";
      magazines.forEach(({ id, data }) => {
        const pages = Array.isArray(data.pages) ? data.pages : [];
        if (!pages.length) return;

        const first = pages[0] || {};
        const coverSource = data.coverImage || data.frontCoverImage || data.introImage ||
          data.firstPageImage || first.src || first.url || first.imageUrl || first.image || "";

        const coverUrlSource = String(coverSource || "").trim();
        const fileId = extractGoogleDriveFileId(coverUrlSource);
        const coverUrl = fileId
          ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`
          : coverUrlSource;
        const format = ["4:5","3:4","2:3","1:1","16:9"].includes(data.pageFormat)
          ? data.pageFormat : "4:5";
        const [ratioW, ratioH] = format.split(":").map(Number);

        const card = document.createElement("a");
        card.className = "album-card";
        card.href = id === "legacy" ? "album.html?id=legacy" : `album.html?id=${encodeURIComponent(id.replace(/^album_/, ""))}`;
        card.style.setProperty("--album-ratio", `${ratioW} / ${ratioH}`);
        card.dataset.format = format;
        card.setAttribute("aria-label", data.title
          ? `Відкрити журнал: ${data.title}`
          : "Відкрити журнал");

        const fallback = document.createElement("div");
        fallback.className = "album-card-placeholder";
        const fallbackTitle = document.createElement("strong");
        fallbackTitle.textContent = data.title || (currentLang === "en" ? "Cosplay magazine" : "Журнал косплеєра");
        fallback.appendChild(fallbackTitle);
        if (data.owner) {
          const fallbackOwner = document.createElement("span");
          fallbackOwner.textContent = data.owner;
          fallback.appendChild(fallbackOwner);
        }

        if (coverUrl) {
          const cover = document.createElement("img");
          cover.src = coverUrl;
          cover.alt = data.title ? `Обкладинка журналу «${data.title}»` : "Обкладинка журналу";
          cover.loading = "lazy";
          cover.referrerPolicy = "no-referrer";
          cover.onerror = () => {
            cover.remove();
            if (!card.contains(fallback)) card.appendChild(fallback);
            console.warn("Не вдалося завантажити обкладинку журналу:", data.title || id);
          };
          card.appendChild(cover);
        } else {
          card.appendChild(fallback);
        }
        albumShelf.appendChild(card);
      });

      albumPreview.style.display = albumShelf.children.length ? "block" : "none";
    } catch (err) {
      console.error("Не вдалося завантажити прев'ю журналів:", err);
      albumPreview.style.display = "none";
    }
  }
  loadSiteTitle();
  loadButtonColors();

  onAuthStateChanged(auth, (user) => {
    currentUser = user;

    if (user) {
      guestControls.classList.add("hidden");
      userControls.classList.remove("hidden");
      appSection.classList.remove("hidden");
      updateAdminButton(user);
      applyBackground(true);
      loadGallery();
      loadAlbumPreview();
    } else {
      guestControls.classList.remove("hidden");
      userControls.classList.add("hidden");
      appSection.classList.add("hidden");
      updateAdminButton(null);
      applyBackground(false);
    }
  });

  async function loadGallery() {
    if (!galleryEl) return;
    await loadEmptyText();
    galleryEl.innerHTML = "";
    try {
      const snap = await getDocs(collection(db, "cosplays"));
      if (snap.empty) {
        // Do not show the empty-gallery placeholder when at least one album exists.
        // Check both the legacy single-album document and the newer albums collection.
        let hasAlbums = false;
        try {
          const [legacyAlbumSnap, settingsSnap] = await Promise.all([
            getDoc(doc(db, "settings", "album")),
            getDocs(collection(db, "settings"))
          ]);

          const legacyData = legacyAlbumSnap.exists() ? legacyAlbumSnap.data() || {} : {};
          const legacyHasPages = Array.isArray(legacyData.pages) && legacyData.pages.length > 0;
          const collectionHasAlbums = settingsSnap.docs.some(albumDoc => {
            const albumData = albumDoc.data() || {};
            return albumDoc.id.startsWith("album_") &&
              Array.isArray(albumData.pages) && albumData.pages.length > 0;
          });

          hasAlbums = legacyHasPages || collectionHasAlbums;
        } catch (albumCheckError) {
          console.warn("Не вдалося перевірити альбоми перед показом порожньої галереї:", albumCheckError);
        }

        if (hasAlbums) {
          galleryEl.innerHTML = "";
        } else {
          const emptyState = document.createElement("div");
          emptyState.className = "gallery-empty-state";
          emptyState.style.cssText = "text-align:center;padding:60px 20px;color:#666;grid-column:1 / -1;";
          const icon = document.createElement("div");
          icon.textContent = "🖼️";
          icon.style.cssText = "font-size:48px;margin-bottom:12px;";
          const message = document.createElement("p");
          message.textContent = emptyText;
          message.style.cssText = "margin:0;font-size:15px;";
          emptyState.append(icon, message);
          galleryEl.replaceChildren(emptyState);
        }
        return;
      }
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (!data.url) return;
        const fileId = extractGoogleDriveFileId(data.url);
        if (!fileId) return;

        const imageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        const card = document.createElement("div");
        card.className = "card";

        const image = document.createElement("img");
        image.src = imageUrl;
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        image.alt = "Cosplay";
        card.appendChild(image);

        if (isAdmin(currentUser)) {
          const deleteButton = document.createElement("button");
          deleteButton.type = "button";
          deleteButton.className = "delete-btn";
          deleteButton.textContent = dict[currentLang].delete_btn;
          deleteButton.addEventListener("click", async () => {
            if (!confirm("Видалити цю картинку?")) return;
            try {
              await deleteDoc(doc(db, "cosplays", docSnap.id));
              loadGallery();
            } catch {
              alert("Помилка видалення");
            }
          });
          card.appendChild(deleteButton);
        }
        galleryEl.appendChild(card);
      });
    } catch {
      galleryEl.innerHTML = '<p style="color:#d93025; text-align:center;">Помилка завантаження</p>';
    }
  }
});
