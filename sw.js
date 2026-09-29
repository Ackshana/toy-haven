const cacheName = "toy-haven-v2";

const files = [
    "index.html",
    "products.html",
    "cart.html",
    "checkout.html",
    "wishlist.html",
    "support.html",
    "css/style.css",
    "js/products.js",
    "js/script.js",
    "manifest.json",
    "assets/favicon.svg",
    "assets/icon-192.png",
    "assets/icon-512.png",
    "assets/astronut.jpg",
    "assets/campervan.jpg",
    "assets/cosmiccat.jpg",
    "assets/dragon.jpg",
    "assets/forest.jpg",
    "assets/garden.jpg",
    "assets/marble.jpg",
    "assets/moon.jpg",
    "assets/orbit.jpg",
    "assets/rallycar.jpg",
    "assets/scooter.jpg",
    "assets/solarrobot.jpg"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName).then(cache => cache.addAll(files))
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== cacheName).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(networkResponse => {
                if (event.request.method === "GET" && networkResponse.ok) {
                    const copy = networkResponse.clone();
                    caches.open(cacheName).then(cache => cache.put(event.request, copy));
                }
                return networkResponse;
            });
        })
    );
});
