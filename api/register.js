export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email, password } = req.body;

  const token = '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'; // Ganti dengan token GitHub kamu
  const owner = 'ikyganzjs';
  const repo = 'mangeakdatabase';
  const path = 'vercel.json';

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    // Ambil file dari GitHub
    const getFile = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    const fileData = await getFile.json();

    if (!getFile.ok) {
      console.error("GAGAL GET FILE:", fileData);
      return res.status(500).json({ message: 'Gagal ambil file dari GitHub.', detail: fileData });
    }

    const sha = fileData.sha;
    const content = Buffer.from(fileData.content, 'base64').toString();
    const users = JSON.parse(content);

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: 'Username sudah terdaftar!' });
    }

    users.push({ username, email, password });

    const updatedContent = Buffer.from(JSON.stringify(users, null, 2)).toString('base64');

    const update = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: `Add user ${username}`,
        content: updatedContent,
        sha,
      }),
    });

    const updateRes = await update.json();

    if (!update.ok) {
      console.error("GAGAL UPDATE:", updateRes);
      return res.status(500).json({ message: 'Gagal update file GitHub.', detail: updateRes });
    }

    return res.status(200).json({ message: 'Pendaftaran berhasil!' });

  } catch (err) {
    console.error("EXCEPTION:", err);
    return res.status(500).json({ message: 'Terjadi kesalahan saat koneksi ke GitHub.', error: err.message });
  }
}
