const axios = require('axios');

async function Ytdll(url, type = 'both') {
    const headers = {
        "accept": "*/*",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "sec-ch-ua": '"Not A(Brand";v="8", "Chromium";v="132"',
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "Referer": "https://id.ytmp3.mobi/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    };

    // Request awal ke API ymcdn
    const initial = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    const init = initial.data;

    if (!init.convertURL) {
        throw new Error("convertURL tidak ditemukan dari server ymcdn");
    }

    // Ambil ID YouTube dari URL
    const id = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?/]+)/)?.[1];
    if (!id) throw new Error("URL YouTube tidak valid atau ID tidak ditemukan");

    const mp4_ = `${init.convertURL}&v=${id}&f=mp4&_=${Math.random()}`;
    const mp3_ = `${init.convertURL}&v=${id}&f=mp3&_=${Math.random()}`;

    let result = {};

    if (type === 'mp3' || type === 'both') {
        const mp3Response = await axios.get(mp3_, { headers });

        if (!mp3Response.data.progressURL) {
            throw new Error("progressURL tidak tersedia untuk MP3");
        }

        let info = {};
        let maxRetry = 20;
        let retry = 0;

        while (true) {
            const j = await axios.get(mp3Response.data.progressURL, { headers });
            info = j.data;
            if (info.progress === 3) break;

            retry++;
            if (retry > maxRetry) throw new Error("Proses konversi MP3 timeout");
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1s
        }

        if (!mp3Response.data.downloadURL) {
            throw new Error("Link MP3 tidak tersedia");
        }

        result.title = info.title || 'Unknown';
        result.mp3 = mp3Response.data.downloadURL;
    }

    if (type === 'mp4' || type === 'both') {
        const mp4Response = await axios.get(mp4_, { headers });

        if (!mp4Response.data.downloadURL) {
            throw new Error("Link MP4 tidak tersedia");
        }

        result.mp4 = mp4Response.data.downloadURL;
    }

    return result;
}

module.exports = function (app) {
    app.get('/download/ytdl', async (req, res) => {
        const { url, type } = req.query;

        if (!url) {
            return res.status(400).json({ status: false, message: "Parameter 'url' diperlukan" });
        }

        try {
            const results = await Ytdll(url, type || 'both');
            res.status(200).json({
                status: true,
                result: results
            });
        } catch (error) {
            console.error("Ytdll Error:", error.response?.data || error.message);
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};
