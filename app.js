// Імпортуємо необхідні модулі Firebase (використовуємо CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Твої реальні налаштування Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnS9-bQngWjNxM1rKz_qRbrQopSd1aAqA",
  authDomain: "cosplay-platform.firebaseapp.com",
  projectId: "cosplay-platform",
  storageBucket: "cosplay-platform.firebasestorage.app",
  messagingSenderId: "524210919675",
  appId: "1:524210919675:web:929740053092247656f85e"
};

// Ініціалізація Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
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
    alert("Не вдалося увійти через Google.");
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

// 3. Відстеження стану користувача
onAuthStateChanged(auth, (user) => {
  if (user) {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    userInfo.textContent = user.email;
    
    // Завантажуємо галерею з бази даних
    loadGalleryFromFirestore();
  } else {
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    galleryEl.innerHTML = '';
  }
});

// --- Функції для Google Диска ---

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

// Завантаження картинок із Firestore (колекція cosplays)
async function loadGalleryFromFirestore() {
  galleryEl.innerHTML = '<p style="color: #aaa;">Завантаження галереї...</p>';
  try {
    const querySnapshot = await getDocs(collection(db, "cosplays"));
    galleryEl.innerHTML = '';
    
    if (querySnapshot.empty) {
      galleryEl.innerHTML = '<p style="color: #aaa;">Поки що немає жодного посилання в базі.</p>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.url) {
        const imageUrl = getDriveImageUrl(data.url, 1000);
        if (imageUrl) {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `<img src="${imageUrl}" loading="lazy" referrerpolicy="no-referrer" alt="Cosplay photo">`;
          galleryEl.appendChild(card);
        }
      }
    });
  } catch (error) {
    console.error("Помилка завантаження бази:", error);
    galleryEl.innerHTML = '<p style="color: #d93025;">Помилка завантаження даних з бази.</p>';
  }
}
