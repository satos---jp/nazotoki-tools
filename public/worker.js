// console.log('service worker',self.addEventListener);

self.addEventListener("install", () => {
    console.log('service worker install ...!');
    self.skipWaiting()
});
self.addEventListener("activate", (event) => {
  console.log('service worker activate ...');
  event.waitUntil(self.clients.claim())
});

self.addEventListener("message", (ev) => {
    if (ev.data && ev.data.type === "deregister") {
        self.registration
            .unregister()
            .then(() => {
                return self.clients.matchAll();
            })
            .then(clients => {
                clients.forEach((client) => client.navigate(client.url));
            });
    }
});

self.addEventListener("fetch", function (event) {
    console.log('service worker fetched',event);
    if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.status === 0) {
                    return response;
                }
                console.log('setting header :: returning fetch response');

                const newHeaders = new Headers(response.headers);
                newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
                newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
                
                console.log('returning new response',newHeaders);
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: newHeaders,
                });
            })
            .catch((e) => console.error(e))
    );
});
