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
const provider = new GoogleAuthProvider();

document.addEventListener("DOMContentLoaded", () => {
  // Елементи інтерфейсу
  const authSection = document.getElementById('auth-section'); // Кутова форма входу
  const userControls = document.getElementById('user-controls'); // Кутова панель користувача (після входу)
  const appSection = document.getElementById('app-section'); // Основний контент (галерея)
  
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  const googleLoginBtn = document.getElementById('google-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const userInfo = document.getElementById('user-info');
  const errorContainer = document.getElementById('error-container');

  // Перемикання вкладок (Вхід / Реєстрація)
  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      if (loginForm) loginForm.classList.remove('hidden');
      if (registerForm) registerForm.classList.add('hidden');
      if (errorContainer) errorContainer.textContent = '';
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      if (registerForm) registerForm.classList.remove('hidden');
      if (loginForm) loginForm.classList.add('hidden');
      if (errorContainer) errorContainer.textContent = '';
    });
  }

  // Реєстрація через пошту/пароль
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorContainer) errorContainer.textContent = '';
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;

      try {
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error("Помилка реєстрації:", error);
        if (errorContainer) errorContainer.textContent = "Помилка реєстрації: перевірте дані.";
      }
    });
  }

  // Вхід через пошту/пароль
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorContainer) errorContainer.textContent = '';
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        console.error("Помилка входу:", error);
        if (errorContainer) errorContainer.textContent = "Невірний email або пароль.";
      }
    });
  }

  // Вхід через Google
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      if (errorContainer) errorContainer.textContent = '';
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Помилка входу через Google:", error);
        if (errorContainer) errorContainer.textContent = "Не вдалося увійти через Google.";
      }
    });
  }

  // Вихід з акаунту
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Помилка виходу:", error);
      }
    });
  }

  // Відстеження стану користувача (головна логіка відображення)
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Якщо увійшли: ховаємо форму, показуємо панель користувача і контент
      if (authSection) authSection.classList.add('hidden');
      if (userControls) userControls.classList.remove('hidden');
      if (appSection) appSection.classList.remove('hidden');
      if (userInfo) userInfo.textContent = user.email;
    } else {
      // Якщо вийшли: показуємо форму, ховаємо панель користувача і контент
      if (authSection) authSection.classList.remove('hidden');
      if (userControls) userControls.classList.add('hidden');
      if (appSection) appSection.classList.add('hidden');
    }
  });
});
