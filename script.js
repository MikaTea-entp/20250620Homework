// alert("gannbaruzo");

// 🌍 メイン関数：位置・天気・時刻を取得
async function getLocationWeatherAndTime() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            console.log("✅ 位置情報取得成功", position);
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            console.log("緯度:", lat, "経度:", lon);

            try {
                const apiKey = 'YOUR_API_KEY_HERE'; // ← 発表時はここにOpenWeatherのAPIキーをぶち込んでデモる。
                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;

                const res = await fetch(url);
                const data = await res.json();

                const city = data.name;
                const weather = data.weather[0].description;
                const temp = data.main.temp;

                const now = new Date();
                const formattedTime = now.toLocaleString('ja-JP', {
                    timeZone: 'Asia/Tokyo',
                    hour12: false
                });

                resolve({ city, weather, temp, time: formattedTime });
            } catch (err) {
                reject('天気情報の取得に失敗しました');
            }
        }, () => {
            reject('位置情報の取得に失敗しました');
        });
    });
}

// 🎯 使用例（Lyrica的な使い方）
document.getElementById('searchBtn').addEventListener('click', async () => {
    try {
        const { city, weather, temp, time } = await getLocationWeatherAndTime();
        document.getElementById('weather').textContent = `${city}・${weather}・${temp}℃（${time}）`;

        const mood = document.getElementById('mood').value;
        const prompt = generatePrompt(city, weather, mood);
        document.getElementById('generatedPrompt').textContent = prompt;
    } catch (err) {
        document.getElementById('weather').textContent = err;
    }
});

// 🧠 プロンプト生成関数
function generatePrompt(city, weatherDesc, moodText) {
    return `今、${city}は${weatherDesc}で、私は「${moodText}」と感じています。
この気分と状況に合う音楽ジャンルやSpotifyで検索できるキーワードを提案してください。`;
}

// 💾 保存ボタン
document.getElementById('saveNoteBtn').addEventListener('click', () => {
    const title = document.getElementById('songTitle').value.trim();
    const artist = document.getElementById('artistName').value.trim();
    const note = document.getElementById('linerNote').value.trim();

    if (title && artist && note) {
        const now = new Date();
        const timestamp = now.toISOString();
        const data = { title, artist, note, time: timestamp };

        localStorage.setItem(`linerNote_${timestamp}`, JSON.stringify(data));

        const msg = document.getElementById('saveMessage');
        msg.classList.remove('hidden');
        msg.textContent = '保存しました ✅';
        setTimeout(() => msg.classList.add('hidden'), 2000);

        loadAllNotes();

        document.getElementById('songTitle').value = '';
        document.getElementById('artistName').value = '';
        document.getElementById('linerNote').value = '';
    }
});

// 📋 ノート一覧を表示
function loadAllNotes() {
    const noteList = document.getElementById('noteList');
    noteList.innerHTML = '';

    const keys = Object.keys(localStorage)
        .filter(k => k.startsWith('linerNote_'))
        .sort()
        .reverse();

    keys.forEach(key => {
        const raw = localStorage.getItem(key);
        try {
            const data = JSON.parse(raw);
            const li = document.createElement('li');
            li.className = "border p-3 rounded shadow bg-white relative";

            li.innerHTML = `
                <p><strong>🎵 ${data.title}</strong> — ${data.artist}</p>
                <p class="text-gray-500 text-sm">${new Date(data.time).toLocaleString('ja-JP')}</p>
                <p class="mt-1 whitespace-pre-wrap" id="note-${key}">${data.note}</p>
                <div class="absolute top-3 right-3 flex gap-2">
                    <button onclick="editNote('${key}')" class="text-blue-600 hover:underline text-sm">✏️ 編集</button>
                    <button onclick="deleteNote('${key}')" class="text-red-600 hover:underline text-sm">🗑 削除</button>
                </div>
            `;
            noteList.appendChild(li);
        } catch (e) {
            // 壊れたデータは無視
        }
    });
}

// ✏️ 編集機能
function editNote(key) {
    const data = JSON.parse(localStorage.getItem(key));
    if (!data) return;

    document.getElementById('songTitle').value = data.title;
    document.getElementById('artistName').value = data.artist;
    document.getElementById('linerNote').value = data.note;

    localStorage.removeItem(key);
    loadAllNotes();
}

// 🗑 削除機能
function deleteNote(key) {
    if (confirm("このノートを削除しますか？")) {
        localStorage.removeItem(key);
        loadAllNotes();
    }
}

// 🚀 初期読み込み
window.addEventListener('DOMContentLoaded', () => {
    loadAllNotes();
});
