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
  getDocs
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

document.addEventListener("DOMContentLoaded", () => {
  // Словник перекладів
  const dict = {
    uk: {
      site_title: "Косплей Галерея",
      login_btn: "Вхід",
      register_btn: "Реєстрація",
      google_btn: "Увійти через Google",
      logout_btn: "Вийти",
      modal_title_login: "Вхід",
      modal_title_register: "Реєстрація",
      modal_submit_login: "Увійти",
      modal_submit_register: "Зареєструватися",
      email_placeholder: "Email",
      password_placeholder: "Пароль",
      err_invalid: "Невірний email або пароль.",
      err_reg: "Помилка реєстрації. Перевірте дані."
    },
    en: {
      site_title: "Cosplay Gallery",
      login_btn: "Login",
      register_btn: "Register",
      google_btn: "Login with Google",
      logout_btn: "Logout",
      modal_title_login: "Login",
      modal_title_register: "Register",
      modal_submit_login: "Login",
      modal_submit_register: "Register",
      email_placeholder: "Email",
      password_placeholder: "Password",
      err_invalid: "Invalid email or password.",
      err_reg: "Registration error. Check your data."
    }
  };

  let currentLang = localStorage.getItem('appLang') || 'uk';
  let isLoginMode = true;

  const modalTitle = document.getElementById('modal-title');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const errorContainer = document.getElementById('error-container');

  // Оновлення текстів на сторінці
  const updateLangUI = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[currentLang][key]) el.textContent = dict[currentLang][key];
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[currentLang][key]) el.placeholder = dict[currentLang][key];
    });

    // Динамічні тексти модалки
    if (modalTitle) modalTitle.textContent = isLoginMode ? dict[currentLang].modal_title_login : dict[currentLang].modal_title_register;
    if (authSubmitBtn) authSubmitBtn.textContent = isLoginMode ? dict[currentLang].modal_submit_login : dict[currentLang].modal_submit_register;

    // Перемикання стилів кнопок мови
    document.getElementById('lang-uk').classList.toggle('active', currentLang === 'uk');
    document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
  };

  // Кліки по мовах
  document.getElementById('lang-uk').addEventListener('click', () => { currentLang = 'uk'; localStorage.setItem('appLang', 'uk'); updateLangUI(); });
  document.getElementById('lang-en').addEventListener('click', () => { currentLang = 'en'; localStorage.setItem('appLang', 'en'); updateLangUI(); });

  // Ініціалізація мови при завантаженні
  updateLangUI();

  // Елементи DOM
  const guestControls = document.getElementById('guest-controls');
  const userControls = document.getElementById('user-controls');
  const appSection = document.getElementById('app-section');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const btnGoogle = document.getElementById('btn-google');
  const btnLogout = document.getElementById('btn-logout');
  const authModal = document.getElementById('auth-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const authForm = document.getElementById('auth-form');

  // Логіка модального вікна
  const openModal = (mode) => {
    isLoginMode = mode === 'login';
    errorContainer.textContent = '';
    authForm.reset();
    updateLangUI();
    authModal.classList.remove('hidden');
  };

  if (btnLogin) btnLogin.addEventListener('click', () => openModal('login'));
  if (btnRegister) btnRegister.addEventListener('click', () => openModal('register'));
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));
  if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.add('hidden'); });

  // Авторизація
  if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
      try { await signInWithPopup(auth, provider); } 
      catch (error) { console.error(error); }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorContainer.textContent = '';
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;

      try {
        if (isLoginMode) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        authModal.classList.add('hidden');
      } catch (error) {
        errorContainer.textContent = isLoginMode ? dict[currentLang].err_invalid : dict[currentLang].err_reg;
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try { await signOut(auth); } catch (error) { console.error(error); }
    });
  }

  // --- Стан користувача ---
  onAuthStateChanged(auth, (user) => {
    if (user) {
      guestControls.classList.add('hidden');
      userControls.classList.remove('hidden');
      appSection.classList.remove('hidden');
    } else {
      guestControls.classList.remove('hidden');
      userControls.classList.add('hidden');
      appSection.classList.add('hidden');
    }
  });
});
