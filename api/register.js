// File: /api/register.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  const { username, email, password } = req.body;

  const token = process.env.GITHUB_TOKEN; // Simpan di Vercel Environment
  const owner = "ikyganzjs";
  const repo = "mangeakdatabase";
  const path = "vercel.json";

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  try {
    // Ambil data dari GitHub
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json"
      }
    });
    const result = await response.json();
    const sha = result.sha;
    const data = JSON.parse(Buffer.from(result.content, 'base64').toString());

    // Cek apakah username sudah ada
    if (data.find(u => u.username === username)) {
      return res.status(400).json({ message: "Username sudah terdaftar!" });
    }

    // Tambah user baru
    data.push({ username, email, password });
    const updatedContent = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    // Simpan ke GitHub
    const save = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        message: `Register user ${username}`,
        content: updatedContent,
        sha: sha
      })
    });

    if (!save.ok) throw new Error("Gagal menyimpan ke GitHub");

    return res.status(200).json({ message: "Pendaftaran berhasil!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan saat koneksi ke GitHub." });
  }
}
