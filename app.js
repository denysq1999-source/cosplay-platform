// Імпортуємо необхідні модулі Firebase (використовуємо CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Твої налаштування Firebase (візьми їх зі своєї консолі Firebase у налаштуваннях проєкту -> General -> Web app)
const firebaseConfig = {
  apiKey: "ТВОЙ_API_KEY",
  authDomain: "ТВОЙ_PROJECT_ID.firebaseapp.com",
  projectId: "ТВОЙ_PROJECT_ID",
  storageBucket: "ТВОЙ_PROJECT_ID.appspot.com",
  messagingSenderId: "ТВОЙ_MESSAGING_SENDER_ID",
  appId: "ТВОЙ_APP_ID"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Елементи сторінки
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const galleryEl = document.getElementById('gallery');

// 1. Кнопка входу через Google
loginBtn.addEventListener('click', async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Помилка входу:", error);
    alert("Не вдалося увійти через Google. Перевір налаштування у Firebase Console.");
  }
});

// 2. Кнопка виходу
logoutBtn.addEventListener('click', async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Помилка виходу:", error);
  }
});

// 3. Відстеження стану користувача (автоматично перемикає екрани)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Користувач увійшов
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    userInfo.textContent = user.email;
    
    // Завантажуємо галерею, коли користувач авторизований
    loadGallery();
  } else {
    // Користувач не увійшов
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    galleryEl.innerHTML = '';
  }
});

// --- Логіка Google Диска (як обговорювали раніше) ---

function extractGoogleDriveFileId(url) {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function getDriveImageUrl(url, size = 1000) {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return '';
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

// Тестові посилання для перевірки
const sampleCosplayLinks = [
  "ТУТ_ВСТАВТЕ_ПОСИЛАННЯ_НА_ФОТКУ_З_ДИСКА_1"
];

function loadGallery() {
  galleryEl.innerHTML = '';
  sampleCosplayLinks.forEach(link => {
    const imageUrl = getDriveImageUrl(link, 1000);
    if (imageUrl) {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<img src="${imageUrl}" loading="lazy" referrerpolicy="no-referrer" alt="Cosplay photo">`;
      galleryEl.appendChild(card);
    }
  });
}
