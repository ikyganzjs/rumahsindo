const axios = require('axios')
const fetch = require('node-fetch');

async function ytmp3(url) {
    const headers = {
        "accept": "*/*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://id.ytmp3.mobi/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    try {
        // Step 1: Inisialisasi
        const initial = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Date.now()}`, { headers });
        const init = await initial.json();

        // Step 2: Ambil video ID
        const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
        if (!id) throw new Error("❌ Gagal mengambil ID video YouTube.");

        // Step 3: Buat URL konversi
        const convertURL = `${init.convertURL}&v=${id}&f=mp3&_=${Date.now()}`;
        const converts = await fetch(convertURL, { headers });
        const convert = await converts.json();

        if (!convert.progressURL || !convert.downloadURL)
            throw new Error("❌ Gagal mendapatkan URL konversi.");

        // Step 4: Tunggu hingga progress selesai
        let info;
        for (let i = 0; i < 5; i++) {
            await new Promise(res => setTimeout(res, 1000)); // delay 1 detik
            const j = await fetch(convert.progressURL, { headers });
            info = await j.json();

            if (info.progress === 3) break;
        }

        if (!info || info.progress !== 3)
            throw new Error("❌ Proses konversi belum selesai atau gagal.");

        return {
            url: convert.downloadURL,
            title: info.title || 'Audio Tanpa Judul'
        };

    } catch (error) {
        console.error("❌ ERROR:", error.message);
        return null;
    }
}


async function ytmp4(url) {
    const headers = {
        "accept": "*/*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://id.ytmp3.mobi/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    try {
        const initial = await fetch(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
        const init = await initial.json();

        const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
        if (!id) throw new Error("Gagal mengambil ID video.");

        let format = 'mp4';
        let convertURL = `${init.convertURL}&v=${id}&f=${format}&_=${Math.random()}`;

        const converts = await fetch(convertURL, { headers });
        const convert = await converts.json();

        let info = {};
        for (let i = 0; i < 3; i++) {
            const j = await fetch(convert.progressURL, { headers });
            info = await j.json();
            console.log(`Progress (${i + 1}):`, info);
            if (info.progress === 3) break;
        }

        return {
            url: convert.downloadURL,
            title: info.title
        };
    } catch (error) {
        console.error('Terjadi kesalahan:', error);
        return null;
    }
}

module.exports = function (app) {
app.get('/download/ytmp3', async (req, res) => {
       const { url } = req.query
        try {
            const results = await ytmp3(url);
            res.status(200).json({
                status: true,
                result: results.url
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});

app.get('/download/ytmp4', async (req, res) => {
       const { url } = req.query
        try {
            const results = await ytmp4(url);
            res.status(200).json({
                status: true,
                result: results.url
            });
        } catch (error) {
            res.status(500).send(`Error: ${error.message}`);
        }
});
}