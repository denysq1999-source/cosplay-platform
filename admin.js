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

const adminContent = document.getElementById('admin-content');
const statusEl = document.getElementById('status');

onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    statusEl.textContent = "Доступ заборонено. Перенаправлення...";
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1200);
    return;
  }

  statusEl.classList.add('hidden');
  adminContent.classList.remove('hidden');
});

// Поки просто логуємо натискання кнопок (функціонал пізніше)
document.getElementById('btn-albums')?.addEventListener('click', () => {
  alert("Альбоми — зробимо далі");
});
document.getElementById('btn-add-photo')?.addEventListener('click', () => {
  alert("Додати фото до альбому — зробимо далі");
});
document.getElementById('btn-edit')?.addEventListener('click', () => {
  alert("Редагувати — зробимо далі");
});
document.getElementById('btn-delete')?.addEventListener('click', () => {
  alert("Видалити — зробимо далі");
});
document.getElementById('btn-publish')?.addEventListener('click', () => {
  alert("Опублікувати — зробимо далі");
});
