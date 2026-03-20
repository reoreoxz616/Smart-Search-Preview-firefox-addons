// ===============================
// hover-preview.js
// ===============================

let hoverPreview = null;

function createHoverPreview() {
    hoverPreview = document.createElement("div");
    hoverPreview.id = "hover-preview-card";

    hoverPreview.style.position = "fixed";
    hoverPreview.style.zIndex = "999999";
    hoverPreview.style.width = "280px";
    hoverPreview.style.background = "#fff";
    hoverPreview.style.border = "1px solid #ddd";
    hoverPreview.style.borderRadius = "8px";
    hoverPreview.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
    hoverPreview.style.padding = "10px";
    hoverPreview.style.display = "none";
    hoverPreview.style.fontFamily = "Roboto, Noto Sans JP, sans-serif";

    hoverPreview.innerHTML = `
        <div id="hp-thumbnail" style="
            width: 100%;
            height: 150px;
            background: #f0f0f0;
            border-radius: 6px;
            margin-bottom: 8px;
        "></div>

        <div id="hp-title" style="
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
            color: #202124;
        ">読み込み中...</div>

        <div id="hp-desc" style="
            font-size: 12px;
            color: #5f6368;
            line-height: 1.4;
        ">説明を取得中...</div>

        <div id="hp-warning" style="
            margin-top: 6px;
            font-size: 12px;
            color: #d93025;
            display: none;
        ">⚠️ 危険な可能性があります</div>
    `;

    document.body.appendChild(hoverPreview);
}

createHoverPreview();

async function updateHoverPreview(url) {
    // タイトル
    const title = url.split("/")[2] || "サイト";
    document.getElementById("hp-title").innerText = title;

    // 説明文（meta description）
    try {
        const res = await fetch(url, { method: "GET" });
        const text = await res.text();

        const descMatch = text.match(/<meta name="description" content="([^"]*)"/i);
        const desc = descMatch ? descMatch[1] : "説明が見つかりませんでした";

        document.getElementById("hp-desc").innerText = desc;
    } catch {
        document.getElementById("hp-desc").innerText = "プレビューを取得できませんでした";
    }

    // サムネイル（仮）
    document.getElementById("hp-thumbnail").style.background = "#e8e8e8";

    // 危険性チェック（background.js と連携）
    chrome.runtime.sendMessage(
        { type: "CHECK_SAFETY", url },
        (response) => {
            const warn = document.getElementById("hp-warning");
            warn.style.display = response.safe ? "none" : "block";
        }
    );
}

// メッセージ受信（表示/非表示）
window.addEventListener("message", (event) => {
    const data = event.data;

    if (data.type === "SHOW_HOVER_PREVIEW") {
        const { url, x, y } = data;

        updateHoverPreview(url);

        hoverPreview.style.left = x + 20 + "px";
        hoverPreview.style.top = y + 20 + "px";
        hoverPreview.style.display = "block";
    }

    if (data.type === "HIDE_HOVER_PREVIEW") {
        hoverPreview.style.display = "none";
    }
});
