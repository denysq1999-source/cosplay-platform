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
  doc
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
      modal_title_login: "Вхід",
      modal_title_register: "Реєстрація",
      modal_submit_login: "Увійти",
      modal_submit_register: "Зареєструватися",
      email_placeholder: "Email",
      password_placeholder: "Пароль",
      err_invalid: "Невірний email або пароль.",
      err_reg: "Помилка реєстрації. Перевірте дані.",
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
      modal_title_login: "Login",
      modal_title_register: "Register",
      modal_submit_login: "Login",
      modal_submit_register: "Register",
      email_placeholder: "Email",
      password_placeholder: "Password",
      err_invalid: "Invalid email or password.",
      err_reg: "Registration error. Check your data.",
      delete_btn: "Delete",
      empty_gallery: "Gallery is empty."
    }
  };

  let currentLang = localStorage.getItem("appLang") || "uk";
  let isLoginMode = true;
  let currentUser = null;

  const modalTitle = document.getElementById("modal-title");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const errorContainer = document.getElementById("error-container");
  const btnAdmin = document.getElementById("btn-admin");
  const galleryEl = document.getElementById("gallery");

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

  const openModal = (mode) => {
    isLoginMode = mode === "login";
    errorContainer.textContent = "";
    authForm.reset();
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
    try { await signInWithPopup(auth, provider); }
    catch (err) { console.error(err); }
  });

  authForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorContainer.textContent = "";
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      authModal.classList.add("hidden");
    } catch {
      errorContainer.textContent = isLoginMode ? dict[currentLang].err_invalid : dict[currentLang].err_reg;
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
    const userEmail = normalizeEmail(user.email);
    const adminEmail = normalizeEmail(ADMIN_EMAIL);
    const result = userEmail === adminEmail;
    console.log("[ADMIN CHECK]", JSON.stringify(userEmail), "vs", JSON.stringify(adminEmail), "=>", result);
    return result;
  }

  function updateAdminButton(user) {
    if (!btnAdmin) return;
    const show = isAdmin(user);
    btnAdmin.style.display = show ? "inline-block" : "none";
    btnAdmin.classList.toggle("hidden", !show);
  }

  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log("[AUTH]", user ? user.email : "logged out", user ? user.uid : "");

    if (user) {
      guestControls.classList.add("hidden");
      userControls.classList.remove("hidden");
      appSection.classList.remove("hidden");
      updateAdminButton(user);
      loadGallery();
    } else {
      guestControls.classList.remove("hidden");
      userControls.classList.add("hidden");
      appSection.classList.add("hidden");
      updateAdminButton(null);
    }
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

  async function loadGallery() {
    if (!galleryEl) return;
    galleryEl.innerHTML = "";
    try {
      const snap = await getDocs(collection(db, "cosplays"));
      if (snap.empty) {
        galleryEl.innerHTML = `<p style="color:#aaa; text-align:center;">${dict[currentLang].empty_gallery}</p>`;
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
