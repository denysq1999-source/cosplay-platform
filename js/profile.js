import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged,
  linkWithCredential,
  EmailAuthProvider
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

const dict = {
  uk: {
    profile_title: "Особистий кабінет",
    back_btn: "← На галерею",
    email_label: "Email",
    providers_label: "Способи входу",
    set_password_label: "Встановити пароль (для входу без Google)",
    password_placeholder: "Новий пароль",
    set_password_btn: "Встановити пароль",
    checking_access: "Перевірка...",
    password_set: "Пароль успішно встановлено. Тепер можна входити і через пошту.",
    password_mismatch: "Паролі не збігаються",
    password_short: "Пароль має бути мінімум 6 символів",
    already_has_password: "Пароль вже встановлено",
    error: "Помилка. Спробуй ще раз."
  },
  en: {
    profile_title: "Profile",
    back_btn: "← Back to Gallery",
    email_label: "Email",
    providers_label: "Sign-in methods",
    set_password_label: "Set password (for login without Google)",
    password_placeholder: "New password",
    set_password_btn: "Set password",
    checking_access: "Checking...",
    password_set: "Password set successfully. You can now log in with email too.",
    password_mismatch: "Passwords do not match",
    password_short: "Password must be at least 6 characters",
    already_has_password: "Password is already set",
    error: "Error. Please try again."
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

const profileContent = document.getElementById("profile-content");
const statusEl = document.getElementById("status");
const profileStatus = document.getElementById("profile-status");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    statusEl.textContent = "Не авторизовано. Перенаправлення...";
    setTimeout(() => { window.location.href = "index.html"; }, 1200);
    return;
  }

  statusEl.classList.add("hidden");
  profileContent.classList.remove("hidden");

  document.getElementById("user-email").textContent = user.email || "—";

  const providers = user.providerData.map(p => p.providerId).join(", ");
  document.getElementById("providers-list").textContent = providers || "—";

  const hasPassword = user.providerData.some(p => p.providerId === "password");
  if (hasPassword) {
    document.getElementById("link-password-section").innerHTML = `<div style="color:#4caf50; font-size:14px;">${dict[currentLang].already_has_password}</div>`;
  }
});

document.getElementById("btn-set-password")?.addEventListener("click", async () => {
  const password = document.getElementById("new-password")?.value || "";
  const confirm = document.getElementById("confirm-password")?.value || "";

  if (password.length < 6) {
    profileStatus.textContent = dict[currentLang].password_short;
    profileStatus.style.color = "#d93025";
    return;
  }

  if (password !== confirm) {
    profileStatus.textContent = dict[currentLang].password_mismatch;
    profileStatus.style.color = "#d93025";
    return;
  }

  const user = auth.currentUser;
  if (!user || !user.email) return;

  try {
    const credential = EmailAuthProvider.credential(user.email, password);
    await linkWithCredential(user, credential);
    profileStatus.textContent = dict[currentLang].password_set;
    profileStatus.style.color = "#4caf50";
    document.getElementById("link-password-section").innerHTML = `<div style="color:#4caf50; font-size:14px;">${dict[currentLang].already_has_password}</div>`;
  } catch (err) {
    console.error(err);
    profileStatus.textContent = dict[currentLang].error;
    profileStatus.style.color = "#d93025";
  }
});
