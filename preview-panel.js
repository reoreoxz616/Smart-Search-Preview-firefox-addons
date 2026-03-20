// ===============================
// preview-panel.js
// ===============================

let previewPanel = null;
let previewIframe = null;
let currentURL = null;

function createPreviewPanel() {
    previewPanel = document.createElement("div");
    previewPanel.id = "preview-panel";

    const savedWidth = localStorage.getItem("previewWidth") || 400;

    previewPanel.style.position = "fixed";
    previewPanel.style.top = "0";
    previewPanel.style.right = "0";
    previewPanel.style.width = savedWidth + "px";
    previewPanel.style.height = "100vh";
    previewPanel.style.background = "#fff";
    previewPanel.style.borderLeft = "1px solid #ddd";
    previewPanel.style.zIndex = "999998";
    previewPanel.style.display = "flex";
    previewPanel.style.flexDirection = "column";
    previewPanel.style.fontFamily = "Roboto, Noto Sans JP, sans-serif";

    // リサイズバー
    const resizeBar = document.createElement("div");
    resizeBar.id = "preview-resize-bar";
    resizeBar.style.width = "6px";
    resizeBar.style.cursor = "ew-resize";
    resizeBar.style.background = "transparent";
    resizeBar.style.position = "absolute";
    resizeBar.style.left = "-3px";
    resizeBar.style.top = "0";
    resizeBar.style.height = "100%";

    previewPanel.appendChild(resizeBar);

    // タブ
    const tabBar = document.createElement("div");
    tabBar.id = "preview-tabs";
    tabBar.style.display = "flex";
    tabBar.style.borderBottom = "1px solid #ddd";
    tabBar.style.height = "40px";

    const tabs = ["ページ", "要約", "翻訳", "安全性"];
    tabs.forEach((name, index) => {
        const tab = document.createElement("div");
        tab.className = "preview-tab";
        tab.innerText = name;
        tab.style.flex = "1";
        tab.style.display = "flex";
        tab.style.alignItems = "center";
        tab.style.justifyContent = "center";
        tab.style.cursor = "pointer";
        tab.style.fontSize = "14px";

        if (index === 0) {
            tab.style.borderBottom = "3px solid #1a73e8";
            tab.dataset.active = "true";
        }

        tab.addEventListener("click", () => switchTab(index));
        tabBar.appendChild(tab);
    });

    previewPanel.appendChild(tabBar);

    // iframe
    previewIframe = document.createElement("iframe");
    previewIframe.id = "preview-iframe";
    previewIframe.style.flex = "1";
    previewIframe.style.border = "none";
    previewIframe.style.width = "100%";

    previewPanel.appendChild(previewIframe);

    document.body.appendChild(previewPanel);

    enableResize(resizeBar);
}

createPreviewPanel();

function switchTab(index) {
    const tabs = document.querySelectorAll(".preview-tab");
    tabs.forEach((tab, i) => {
        tab.style.borderBottom = i === index ? "3px solid #1a73e8" : "none";
        tab.dataset.active = i === index ? "true" : "false";
    });

    if (index === 0) {
        previewIframe.src = currentURL;
    } else if (index === 1) {
        previewIframe.srcdoc = `<div style='padding:20px;font-size:16px;'>AI要約（有料機能）</div>`;
    } else if (index === 2) {
        previewIframe.srcdoc = `<div style='padding:20px;font-size:16px;'>翻訳（有料機能）</div>`;
    } else if (index === 3) {
        loadSafetyInfo(currentURL);
    }
}

function enableResize(resizeBar) {
    let isResizing = false;

    resizeBar.addEventListener("mousedown", () => {
        isResizing = true;
        document.body.style.cursor = "ew-resize";
    });

    document.addEventListener("mousemove", (e) => {
        if (!isResizing) return;

        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < 800) {
            previewPanel.style.width = newWidth + "px";
            localStorage.setItem("previewWidth", newWidth);
        }
    });

    document.addEventListener("mouseup", () => {
        isResizing = false;
        document.body.style.cursor = "default";
    });
}

function loadSafetyInfo(url) {
    chrome.runtime.sendMessage(
        { type: "CHECK_SAFETY", url },
        (response) => {
            if (response.safe) {
                previewIframe.srcdoc = `
                    <div style='padding:20px;font-size:16px;'>
                        ✅ このサイトは安全と判断されました
                    </div>
                `;
            } else {
                previewIframe.srcdoc = `
                    <div style='padding:20px;font-size:16px;color:#d93025;'>
                        ⚠️ 危険な可能性があります<br><br>
                        ・マルウェア<br>
                        ・フィッシング<br>
                        ・不正ソフトウェア<br><br>
                        開く際は十分注意してください。
                    </div>
                `;
            }
        }
    );
}

// URL を受け取って iframe に読み込む
window.addEventListener("message", (event) => {
    if (event.data.type === "OPEN_PREVIEW_PANEL") {
        currentURL = event.data.url;
        previewIframe.src = currentURL;
    }
});
