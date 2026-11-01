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

const adminContent = document.getElementById("admin-content");
const statusEl = document.getElementById("status");
const albumsSection = document.getElementById("albums-section");
const btnAlbums = document.getElementById("btn-albums");

onAuthStateChanged(auth, (user) => {
  if (!user || user.email?.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    statusEl.textContent = "Доступ заборонено. Перенаправлення...";
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

document.getElementById("btn-publish")?.addEventListener("click", () => {
  alert("Опублікувати — зробимо далі");
});
