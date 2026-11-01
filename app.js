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
  addDoc 
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
  // Елементи
  const guestControls = document.getElementById('guest-controls');
  const userControls = document.getElementById('user-controls');
  const appSection = document.getElementById('app-section');
  const userInfo = document.getElementById('user-info');
  
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const btnGoogle = document.getElementById('btn-google');
  const btnLogout = document.getElementById('btn-logout');

  const authModal = document.getElementById('auth-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalTitle = document.getElementById('modal-title');
  const authForm = document.getElementById('auth-form');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const errorContainer = document.getElementById('error-container');

  const galleryEl = document.getElementById('gallery');
  const imageUrlInput = document.getElementById('image-url-input');
  const addImageBtn = document.getElementById('add-image-btn');

  let isLoginMode = true;

  // Логіка модального вікна
  const openModal = (mode) => {
    isLoginMode = mode === 'login';
    if (modalTitle) modalTitle.textContent = isLoginMode ? 'Вхід' : 'Реєстрація';
    if (authSubmitBtn) authSubmitBtn.textContent = isLoginMode ? 'Увійти' : 'Зареєструватися';
    if (errorContainer) errorContainer.textContent = '';
    if (authForm) authForm.reset();
    if (authModal) authModal.classList.remove('hidden');
  };

  if (btnLogin) btnLogin.addEventListener('click', () => openModal('login'));
  if (btnRegister) btnRegister.addEventListener('click', () => openModal('register'));
  if (closeModalBtn) closeModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));
  if (authModal) authModal.addEventListener('click', (e) => { if (e.target === authModal) authModal.classList.add('hidden'); });

  // Авторизація
  if (btnGoogle) {
    btnGoogle.addEventListener('click', async () => {
      try { await signInWithPopup(auth, provider); } 
      catch (error) { console.error(error); alert("Помилка входу через Google"); }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorContainer) errorContainer.textContent = '';
      const email = document.getElementById('auth-email').value;
      const password = document.getElementById('auth-password').value;

      try {
        if (isLoginMode) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
        if (authModal) authModal.classList.add('hidden');
      } catch (error) {
        if (errorContainer) errorContainer.textContent = isLoginMode ? "Невірний email або пароль." : "Помилка реєстрації. Перевірте дані.";
      }
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try { await signOut(auth); } catch (error) { console.error(error); }
    });
  }

  // --- ГОЛОВНА ЛОГІКА ХОВАННЯ КНОПОК ---
  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (guestControls) guestControls.classList.add('hidden');
      if (userControls) userControls.classList.remove('hidden');
      if (appSection) appSection.classList.remove('hidden');
      if (userInfo) userInfo.textContent = user.email;
      loadGalleryFromFirestore();
    } else {
      if (guestControls) guestControls.classList.remove('hidden');
      if (userControls) userControls.classList.add('hidden');
      if (appSection) appSection.classList.add('hidden');
      if (galleryEl) galleryEl.innerHTML = '';
    }
  });

  // База даних
  if (addImageBtn && imageUrlInput) {
    addImageBtn.addEventListener('click', async () => {
      const url = imageUrlInput.value.trim();
      if (!url) return;
      try {
        await addDoc(collection(db, "cosplays"), { url: url, createdAt: new Date() });
        imageUrlInput.value = '';
        loadGalleryFromFirestore();
      } catch (error) { console.error(error); alert("Помилка додавання."); }
    });
  }

  function extractGoogleDriveFileId(url) {
    if (!url) return null;
    const patterns = [ /\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/ ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  }

  async function loadGalleryFromFirestore() {
    if (!galleryEl) return;
    galleryEl.innerHTML = '<p style="color: #aaa;">Завантаження...</p>';
    try {
      const querySnapshot = await getDocs(collection(db, "cosplays"));
      galleryEl.innerHTML = '';
      if (querySnapshot.empty) { galleryEl.innerHTML = '<p style="color: #aaa;">Галерея порожня.</p>'; return; }
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.url) {
          const fileId = extractGoogleDriveFileId(data.url);
          if (fileId) {
            const imageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `<img src="${imageUrl}" loading="lazy" referrerpolicy="no-referrer" alt="Cosplay photo">`;
            galleryEl.appendChild(card);
          }
        }
      });
    } catch (error) { galleryEl.innerHTML = '<p style="color: #d93025;">Помилка завантаження даних.</p>'; }
  }
});
