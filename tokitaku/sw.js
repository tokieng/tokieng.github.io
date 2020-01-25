//  Copyright 2020 tokieng

// refer to https://developers.google.com/web/fundamentals/primers/service-workers

const CACHE_NAME = "dentaku_cache";
const CACHE_FILES = [
	"./",
	"./index.html",
	"./digits.js",
	"./js/jquery-3.4.1.slim.min.js",
	"./js/bootstrap.bundle.min.js",
	"./css/bootstrap.min.css",
];

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then( function(cache) {
			console.log("cache.addAll");
			return cache.addAll(CACHE_FILES);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request)
		.then( function(response) {
			if (response) {
				return response;
			} else {
				return fetch(event.request);
			}
		})
	);
});

self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					return caches.delete(CACHE_NAME);
				})
			);
		})
	);
});
