import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
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
      remember_password: "Запам’ятати пароль",
      err_invalid: "Невірний email або пароль.",
      err_reg: "Помилка реєстрації. Перевірте дані.",
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
      remember_password: "Remember password",
      err_invalid: "Invalid email or password.",
      err_reg: "Registration error. Check your data.",
      err_google_exists: "This email is already registered via Google. Please sign in with Google.",
      err_email_exists: "This email already exists. Try logging in or reset the password.",
      delete_btn: "Delete",
      empty_gallery: "Gallery is empty."
    }
  };

  let currentLang = localStorage.getItem("appLang") || "uk";
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
  const albumCover = document.getElementById("album-cover");
  const albumPreviewTitle = document.getElementById("album-preview-title");
  const albumPreviewCount = document.getElementById("album-preview-count");

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
    localStorage.setItem("appLang", "uk");
    updateLangUI();
  });
  document.getElementById("lang-en").addEventListener("click", () => {
    currentLang = "en";
    localStorage.setItem("appLang", "en");
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

  function loadSavedCredentials() {
    const saved = localStorage.getItem("savedCredentials");
    if (saved) {
      try {
        const { email, password } = JSON.parse(saved);
        document.getElementById("auth-email").value = email || "";
        document.getElementById("auth-password").value = password || "";
        if (rememberCheckbox) rememberCheckbox.checked = true;
      } catch {}
    }
  }

  const openModal = (mode) => {
    isLoginMode = mode === "login";
    errorContainer.textContent = "";
    if (mode === "login") loadSavedCredentials();
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
    try { await signInWithPopup(auth, provider); } catch (err) { console.error(err); }
  });

  authForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorContainer.textContent = "";
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    if (isLoginMode && rememberCheckbox?.checked) {
      localStorage.setItem("savedCredentials", JSON.stringify({ email, password }));
    } else if (isLoginMode) {
      localStorage.removeItem("savedCredentials");
    }

    try {
      if (isLoginMode) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
      authModal.classList.add("hidden");
    } catch (err) {
      console.error(err);
      let msg = isLoginMode ? dict[currentLang].err_invalid : dict[currentLang].err_reg;
      if (err.code === "auth/account-exists-with-different-credential" || err.code === "auth/email-already-in-use") {
        msg = dict[currentLang].err_google_exists;
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
        const fileId = data.fileId || (data.url?.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]) || (data.url?.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1]);
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
    } catch (err) { console.error(err); }
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
    if (!url) return null;
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }

  async function loadAlbumPreview() {
    try {
      const snap = await getDoc(doc(db, "settings", "album"));
      if (!snap.exists()) {
        albumPreview.style.display = "none";
        return;
      }
      const data = snap.data() || {};
      const pages = Array.isArray(data.pages) ? data.pages : [];
      if (!pages.length) {
        albumPreview.style.display = "none";
        return;
      }

      // The outside cover is shown on the gallery shelf. The intro text remains
      // inside the book and is only visible after opening the magazine.
      const first = pages[0] || {};
      const coverSource = data.coverImage || data.frontCoverImage || data.introImage ||
        data.firstPageImage || first.src || first.url || first.imageUrl || first.image || "";
      const fileId = extractGoogleDriveFileId(coverSource);
      const coverUrl = fileId
        ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`
        : coverSource;

      const format = ["4:5","3:4","2:3","1:1","16:9"].includes(data.pageFormat)
        ? data.pageFormat : "4:5";
      const [ratioW, ratioH] = format.split(":").map(Number);
      const albumCard = document.getElementById("album-card");
      if (albumCard) {
        albumCard.style.setProperty("--album-ratio", `${ratioW} / ${ratioH}`);
        albumCard.setAttribute("aria-label", data.title
          ? `Відкрити журнал: ${data.title}`
          : "Відкрити журнал");
      }

      if (albumCover) {
        albumCover.onload = () => { albumCover.style.visibility = "visible"; };
        albumCover.onerror = () => {
          albumCover.removeAttribute("src");
          albumCover.style.visibility = "hidden";
          console.warn("Не вдалося завантажити обкладинку журналу. Перевір посилання та доступ Google Drive.");
        };
        albumCover.style.visibility = "hidden";
        albumCover.src = coverUrl;
        albumCover.alt = data.title ? `Обкладинка журналу «${data.title}»` : "Обкладинка журналу";
      }

      albumPreview.style.display = "block";
    } catch (err) {
      console.error("Не вдалося завантажити прев'ю альбому:", err);
      albumPreview.style.display = "none";
    }
  }
  loadEmptyText();
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
    galleryEl.innerHTML = "";
    try {
      const snap = await getDocs(collection(db, "cosplays"));
      if (snap.empty) {
        // Do not show the empty-gallery placeholder when at least one album exists.
        // Check both the legacy single-album document and the newer albums collection.
        let hasAlbums = false;
        try {
          const [legacyAlbumSnap, albumsSnap] = await Promise.all([
            getDoc(doc(db, "settings", "album")),
            getDocs(collection(db, "albums"))
          ]);

          const legacyData = legacyAlbumSnap.exists() ? legacyAlbumSnap.data() || {} : {};
          const legacyHasPages = Array.isArray(legacyData.pages) && legacyData.pages.length > 0;
          const collectionHasAlbums = albumsSnap.docs.some(albumDoc => {
            const albumData = albumDoc.data() || {};
            return Array.isArray(albumData.pages) && albumData.pages.length > 0;
          });

          hasAlbums = legacyHasPages || collectionHasAlbums;
        } catch (albumCheckError) {
          console.warn("Не вдалося перевірити альбоми перед показом порожньої галереї:", albumCheckError);
        }

        if (hasAlbums) {
          galleryEl.innerHTML = "";
        } else {
          galleryEl.innerHTML = `
            <div class="gallery-empty-state" style="text-align:center; padding:60px 20px; color:#666;">
              <div style="font-size:48px; margin-bottom:12px;">🖼️</div>
              <p style="margin:0; font-size:15px;">${emptyText}</p>
            </div>
          `;
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

        let del = "";
        if (isAdmin(currentUser)) {
          del = `<button class="delete-btn" data-id="${docSnap.id}">${dict[currentLang].delete_btn}</button>`;
        }

        card.innerHTML = `
          <img src="${imageUrl}" loading="lazy" referrerpolicy="no-referrer" alt="Cosplay">
          ${del}
        `;
        galleryEl.appendChild(card);
      });

      document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.getAttribute("data-id");
          if (!confirm("Видалити цю картинку?")) return;
          try {
            await deleteDoc(doc(db, "cosplays", id));
            loadGallery();
          } catch {
            alert("Помилка видалення");
          }
        });
      });
    } catch {
      galleryEl.innerHTML = '<p style="color:#d93025; text-align:center;">Помилка завантаження</p>';
    }
  }
});
