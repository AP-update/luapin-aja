<div align="center">
  <img src="https://img.icons8.com/?size=256&id=103322&format=png&color=4F46E5" alt="Luapin Aja Logo" width="120">
  
  <h1>✨ Luapin Aja ✨</h1>
  
  <p>
    <b>Nirwana Pikiran • Keamanan IP • Bebas Bercerita</b><br>
    <i>Platform anonim modern untuk berbagi keluh kesah tanpa login. Dilengkapi sistem proteksi spam dan dashboard kurasi admin yang aman.</i>
  </p>

  <div>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
    <img src="https://img.shields.io/badge/Cloudflare_Turnstile-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Turnstile">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
  </div>
</div>

<br>
<hr>
<br>

<h2>🛠️ Fitur Utama & Pembaruan</h2>

<table>
  <tr>
    <td width="50%">
      <h3>🔢 ID Postingan Berurutan</h3>
      <p>Menggunakan sistem counter pada Firestore sehingga setiap postingan memiliki ID angka yang rapi (Contoh: #1, #2, #3) untuk kemudahan navigasi.</p>
    </td>
    <td width="50%">
      <h3>🚫 Proteksi IP (Hemat Database)</h3>
      <p>Sistem mencatat Alamat IP untuk memastikan satu pengguna hanya dapat memberikan <b>1 Dukungan</b> dan <b>1 Komentar</b> per postingan guna mencegah spam.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔐 Admin Password JSON</h3>
      <p>Keamanan lebih terjaga dengan pengaturan password admin yang terpusat di dalam file konfigurasi JSON, bukan di dalam kode utama (Hardcoded).</p>
    </td>
    <td width="50%">
      <h3>📱 Desain Glassmorphism</h3>
      <p>Antarmuka modern yang sepenuhnya responsif, menggunakan Tailwind CSS dengan efek transparansi mewah dan animasi yang halus.</p>
    </td>
  </tr>
</table>

<br>

<h2>💻 Panduan Instalasi</h2>

<p>Ikuti langkah-langkah di bawah ini untuk menjalankan project di lingkungan lokal atau Termux:</p>

<ol>
  <li>
    <b>Clone Repository</b>
<pre><code>git clone https://github.com/USERNAME/luapin-aja.git
cd luapin-aja</code></pre>
  </li>
  <li>
    <b>Install Modul</b>
<pre><code>npm install</code></pre>
  </li>
  <li>
    <b>Konfigurasi Firebase & Admin</b>
    <br><br>
    <details>
      <summary><b>👉 Klik di sini untuk cara mendapatkan serviceAccountKey.json</b></summary>
      <br>
      <ol>
        <li>Buka <a href="https://console.firebase.google.com/">Firebase Console</a> dan pilih proyek Anda.</li>
        <li>Klik ikon <b>Gear (Settings)</b> > <b>Project Settings</b>.</li>
        <li>Masuk ke tab <b>Service Accounts</b>.</li>
        <li>Pilih <b>Node.js</b> dan klik <b>Generate New Private Key</b>.</li>
        <li>Ubah nama file yang terunduh menjadi <code>serviceAccountKey.json</code>.</li>
        <li>Buka file tersebut, tambahkan baris berikut sebelum tanda <code>}</code> paling akhir:
          <pre><code>"admin_password": "isi_password_admin_kamu"</code></pre>
        </li>
        <li>Simpan file di folder utama project.</li>
      </ol>
    </details>
    <br>
  </li>
  <li>
    <b>Konfigurasi Turnstile</b>
    <p>Dapatkan <i>Site Key</i> & <i>Secret Key</i> dari Cloudflare Turnstile. Update di <code>views/post.ejs</code> dan <code>index.js</code>.</p>
  </li>
  <li>
    <b>Jalankan Aplikasi</b>
<pre><code>npm start</code></pre>
    <p>Akses melalui <code>http://localhost:3000</code>.</p>
  </li>
</ol>

<br>

<h2>🌐 Deploy ke Vercel</h2>

<p>Project ini sudah dikonfigurasi untuk <b>Vercel Serverless Functions</b>:</p>
<ul>
  <li>Pastikan file <code>vercel.json</code> sudah ada di folder utama.</li>
  <li>Hubungkan repository GitHub ke dashboard Vercel.</li>
  <li>Environment variable akan terbaca otomatis dari file konfigurasi yang diunggah.</li>
</ul>

<br>
<hr>

<div align="center">
  <p>Diciptakan untuk memberikan ruang bagi mereka yang ingin bicara tanpa nama.</p>
  <p><b>Copyright &copy; 2026 AP. All rights reserved.</b></p>
</div>
