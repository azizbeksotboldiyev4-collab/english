import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// ============================================
// Service Worker — Offline rejim uchun
// ============================================
// Lovable preview (iframe) ichida SW ro'yxatdan o'tmaydi —
// faqat published saytda yoki Add to Home Screen qilingan PWA da ishlaydi.

const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname === "localhost";

if (isPreviewHost || isInIframe) {
  // Preview/iframe — eski SW bo'lsa, o'chiramiz
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }
} else if ("serviceWorker" in navigator) {
  // Production — SW ro'yxatdan o'tkazamiz
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        console.log("[PWA] Service Worker ro'yxatdan o'tdi:", reg.scope);
        // Yangilanish topilsa, darhol qo'llash
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              sw.postMessage("SKIP_WAITING");
            }
          });
        });
      })
      .catch((err) => console.warn("[PWA] SW xato:", err));
  });
}
