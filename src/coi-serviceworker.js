(() => {
  // You can customize the behavior of this script through a global `coi` variable.
  const coi = {
      shouldRegister: () => true,
      shouldDeregister: () => false,
      doReload: () => window.location.reload(),
      quiet: false,
      ...window.coi
  }

  const n = navigator;
  if (coi.shouldDeregister() && n.serviceWorker && n.serviceWorker.controller) {
      n.serviceWorker.controller.postMessage({ type: "deregister" });
  }

  // If we're already coi: do nothing. Perhaps it's due to this script doing its job, or COOP/COEP are
  // already set from the origin server. Also if the browser has no notion of crossOriginIsolated, just give up here.
  if (window.crossOriginIsolated !== false || !coi.shouldRegister()) return;

  if (!window.isSecureContext) {
      !coi.quiet && console.log("COOP/COEP Service Worker not registered, a secure context is required.");
      return;
  }

  // In some environments (e.g. Chrome incognito mode) this won't be available
  if (n.serviceWorker) {
      n.serviceWorker.register('/nazotoki-tools/worker.js').then(
          (registration) => {
              !coi.quiet && console.log("COOP/COEP Service Worker registered", registration.scope);

              registration.addEventListener("updatefound", () => {
                  !coi.quiet && console.log("Reloading page to make use of updated COOP/COEP Service Worker.");
                //   coi.doReload()
              });

              // If the registration is active, but it's not controlling the page
              if (registration.active && !n.serviceWorker.controller) {
                  !coi.quiet && console.log("Reloading page to make use of COOP/COEP Service Worker.");
                //   coi.doReload()
              }
          },
          (err) => {
              !coi.quiet && console.error("COOP/COEP Service Worker failed to register:", err);
          }
      );
  }
})();

export {}