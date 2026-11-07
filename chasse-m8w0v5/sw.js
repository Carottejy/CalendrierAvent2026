// Service worker propre à cette appli : il ne gère que son propre dossier.
// Incrémenter VERSION à chaque modification de l'appli.
const VERSION = 1;
const CACHE = 'chasse-m8w0v5-v' + VERSION;

// Fichiers à garder hors ligne (ajouter ici les images, sons, etc. de l'appli)
const FICHIERS = [
  './',
  'index.html',
  'manifest.webmanifest',
  'style.css',
  'creatures.js',
  'app.js',
  'icones/icone-192.png',
  'icones/icone-512.png',
  'icones/icone-maskable-512.png',
  'icones/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cles) =>
      Promise.all(cles.filter((k) => k.startsWith('chasse-m8w0v5-') && k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Réseau d'abord (pour recevoir les mises à jour), cache si hors ligne.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
