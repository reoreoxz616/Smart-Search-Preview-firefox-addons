// ===============================
// background.js
// ===============================

// Google Safe Browsing API のキー（必要なら設定）
const API_KEY = ""; // あとであなたのキーを入れる

async function checkSafety(url) {
    if (!API_KEY) return { safe: true };

    const body = {
        client: {
            clientId: "smart-search-preview",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
        }
    };

    try {
        const res = await fetch(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
            {
                method: "POST",
                body: JSON.stringify(body)
            }
        );

        const data = await res.json();
        const isSafe = !data.matches;

        return { safe: isSafe };
    } catch (e) {
        console.error("Safety check failed:", e);
        return { safe: true };
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "CHECK_SAFETY") {
        checkSafety(message.url).then(result => {
            sendResponse(result);
        });
        return true; // 非同期レスポンス
    }
});
