if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
    });
} else {
    console.log("ServiceWorker belum didukung browser ini.");
}