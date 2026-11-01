// 1. Функція витягування ID файлу з будь-якого посилання Google Drive
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

// 2. Функція генерації посилання на мініатюру потрібного розміру
function getDriveImageUrl(url, size = 1000) {
  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return '';
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

// 3. Тестовий масив посилань (сюди потім затягнемо дані з Firebase чи адмінки)
const sampleCosplayLinks = [
  "ТУТ_ВСТАВТЕ_ПОСИЛАННЯ_НА_ФОТКУ_З_ДИСКА_1",
  "ТУТ_ВСТАВТЕ_ПОСИЛАННЯ_НА_ФОТКУ_З_ДИСКА_2"
];

// Рендеримо картки на сторінці
const galleryEl = document.getElementById('gallery');

sampleCosplayLinks.forEach(link => {
  const imageUrl = getDriveImageUrl(link, 1000);
  if (imageUrl) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<img src="${imageUrl}" loading="lazy" referrerpolicy="no-referrer" alt="Cosplay photo">`;
    galleryEl.appendChild(card);
  }
});
