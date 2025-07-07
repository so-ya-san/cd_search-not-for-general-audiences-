const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 🔗 JSONファイルの保存先を指定
const requestsPath = path.join(__dirname, 'requests.json');
const cdListPath = path.join(__dirname, 'cd_list.json');

// 📨 リクエスト登録 API（timestamp を保存）
app.post('/api/requestTrack', (req, res) => {
    const { nickname, track } = req.body;
    const newRequest = {
        nickname,
        track,
        timestamp: Date.now() // ✅ 送信時間を記録！
    };

    let requests = [];
    if (fs.existsSync(requestsPath)) {
        requests = JSON.parse(fs.readFileSync(requestsPath));
    }

    requests.push(newRequest);
    fs.writeFileSync(requestsPath, JSON.stringify(requests, null, 2));
    res.json({ success: true });
});

// 📋 リクエスト一覧取得 API
app.get('/api/getRequests', (req, res) => {
    if (!fs.existsSync(requestsPath)) return res.json([]);
    const requests = JSON.parse(fs.readFileSync(requestsPath));
    res.json(requests);
});

// ➕ トラック追加 API
app.post('/api/addTrack', (req, res) => {
    const newTrack = req.body;
    let cdList = [];
    if (fs.existsSync(cdListPath)) {
        cdList = JSON.parse(fs.readFileSync(cdListPath));
    }

    cdList.push(newTrack);
    fs.writeFileSync(cdListPath, JSON.stringify(cdList, null, 2));
    res.json({ track: newTrack });
});

// ❌ トラック削除 API
app.delete('/api/deleteTrack/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (!fs.existsSync(cdListPath)) return res.status(500).json({ error: 'CDファイルが見つかりません' });

    let cdList = JSON.parse(fs.readFileSync(cdListPath));
    cdList.splice(index, 1);
    fs.writeFileSync(cdListPath, JSON.stringify(cdList, null, 2));
    res.json({ success: true });
});

// 📝 トラック更新 API
app.put('/api/updateTrack/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const updatedTrack = req.body;
    if (!fs.existsSync(cdListPath)) return res.status(500).json({ error: 'CDファイルが見つかりません' });

    let cdList = JSON.parse(fs.readFileSync(cdListPath));
    cdList[index] = updatedTrack;
    fs.writeFileSync(cdListPath, JSON.stringify(cdList, null, 2));
    res.json({ success: true });
});

// 🧹 古いリクエスト（30日以上）を削除する関数
function cleanOldRequests() {
    if (!fs.existsSync(requestsPath)) return;

    const now = Date.now();
    const cutoff = now - 1000 * 60 * 60 * 24 * 30; // 30日分のミリ秒
    const requests = JSON.parse(fs.readFileSync(requestsPath));
    const filtered = requests.filter(req => req.timestamp > cutoff);

    fs.writeFileSync(requestsPath, JSON.stringify(filtered, null, 2));
    const removedCount = requests.length - filtered.length;
    if (removedCount > 0) {
        console.log(`🧹 古いリクエストを ${removedCount} 件削除しました`);
    }
}

// ✅ サーバー起動時と毎日定期的にクリーニング実行
cleanOldRequests();
setInterval(cleanOldRequests, 1000 * 60 * 60 * 24); // 毎日1回（24時間）

// 🚀 サーバー起動
app.listen(PORT, () => {
    console.log(`🌐 Expressサーバー起動中 http://localhost:${PORT}`);
});