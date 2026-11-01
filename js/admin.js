import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  EmailAuthProvider,
  linkWithCredential 
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

const ADMIN_EMAIL = "denysq1999@gmail.com";

const adminContent = document.getElementById("admin-content");
const statusEl = document.getElementById("status");
const albumsSection = document.getElementById("albums-section");
const btnAlbums = document.getElementById("btn-albums");
const linkStatus = document.getElementById("link-status");

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

// Прив’язка email/пароль до поточного акаунта
document.getElementById("btn-link-email")?.addEventListener("click", async () => {
  const email = document.getElementById("link-email")?.value.trim();
  const password = document.getElementById("link-password")?.value;

  if (!email || !password) {
    linkStatus.textContent = "Вкажи email і пароль";
    linkStatus.style.color = "#d93025";
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    linkStatus.textContent = "Спочатку зайди через Google";
    linkStatus.style.color = "#d93025";
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
    linkStatus.textContent = "Успішно прив’язано! Тепер можна заходити і через email/пароль.";
    linkStatus.style.color = "#4caf50";
    document.getElementById("link-password").value = "";
  } catch (err) {
    console.error(err);
    let msg = "Помилка прив’язки";
    if (err.code === "auth/provider-already-linked") msg = "Email вже прив’язаний";
    if (err.code === "auth/email-already-in-use") msg = "Цей email вже використовується іншим акаунтом";
    if (err.code === "auth/weak-password") msg = "Пароль занадто слабкий (мінімум 6 символів)";
    linkStatus.textContent = msg;
    linkStatus.style.color = "#d93025";
  }
});
