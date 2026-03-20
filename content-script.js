// ===============================
// content-script.js
// ===============================

// 右側パネルへURLを送る
function openPreviewPanel(url) {
    window.postMessage({
        type: "OPEN_PREVIEW_PANEL",
        url: url
    }, "*");
}

// 検索結果リンクを汎用的に検出
function detectSearchResults() {
    const links = Array.from(document.querySelectorAll("a"))
        .filter(a => {
            const href = a.href;

            // 外部サイトのみ
            if (!href.startsWith("http")) return false;

            // 検索エンジン内部リンク除外
            if (href.includes("google.com") || href.includes("bing.com")) return false;

            // 広告除外（ad, sponsored）
            const text = a.innerText.toLowerCase();
            if (text.includes("広告") || text.includes("sponsored")) return false;

            // 画面に表示されている要素のみ
            const rect = a.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;

            return true;
        });

    return links;
}

// ホバーイベントを付与
function attachHoverEvents() {
    const results = detectSearchResults();

    results.forEach(link => {
        if (link.dataset.previewAttached === "true") return;
        link.dataset.previewAttached = "true";

        link.addEventListener("mouseenter", (e) => {
            window.postMessage({
                type: "SHOW_HOVER_PREVIEW",
                url: link.href,
                x: e.clientX,
                y: e.clientY
            }, "*");
        });

        link.addEventListener("mouseleave", () => {
            window.postMessage({ type: "HIDE_HOVER_PREVIEW" }, "*");
        });

        link.addEventListener("click", (e) => {
            e.preventDefault();
            openPreviewPanel(link.href);
        });
    });
}

// 検索結果の変化を監視（SPA対応）
const observer = new MutationObserver(() => {
    attachHoverEvents();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 初回実行
attachHoverEvents();
