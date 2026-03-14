# ✨ AI Text Formatter & Humanizer

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-cyan?logo=tailwindcss)](https://tailwindcss.com)

Aplikasi web cerdas untuk memformat teks mentah dari AI (ChatGPT, Gemini, Claude, Copilot) menjadi format dokumen akademik standar (Skripsi, Makalah, Jurnal, dll.), serta memanusiakan (Humanize) teks AI agar lolos deteksi seperti Turnitin.

## 🚀 Fitur Utama

### 1. Auto-Format Dokumen
* **Konversi Otomatis**: Mendeteksi Headings, Paragraf, Lists, Quote, Table, & Markdown dari hasil output AI.
* **Daftar Isi Otomatis**: Merapikan format daftar isi dengan "leader dots" (......) khusus untuk Skripsi / Laporan.
* **Berbagai Preset**: Mendukung tipe dokumen Skripsi, Makalah, Jurnal, Laporan, dan Essay.

### 2. 🛡️ Humanisasi (Anti-Turnitin)
* **Memanusiakan Teks AI**: Mampu mengubah struktur kalimat, menggunakan sinonim lebih natural, dan membuang frasa khas buatan AI ("Selain itu", "Penting untuk diingat", dll).
* **3 Level Intensitas**: Ringan, Sedang, Maksimal (menyesuaikan persentase perubahan teks).
* **Safety Meter**: Estimasi keamanan teks dari deteksi robot.

### 3. Ekspor & Keamanan
* **Ekspor MS Word (.docx)**: Download teks yang sudah diformat langsung ke `.docx`.
* **Copy HTML / Teks Asli**: Mudah untuk di-paste kembali.
* **Auto-Save**: Teks tidak akan hilang walaupun browser di-refresh.

---

## 💻 Instalasi Lokal

Jika Anda ingin menjalankan atau mengembangkan project ini di komputer Anda:

1. **Clone repository ini**
   ```bash
   git clone https://github.com/username/ai-text-formatter.git
   cd ai-text-formatter
   ```

2. **Install dependensi (npm/yarn)**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Jalankan local server**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

4. Buka `http://localhost:5173` di browser Anda.

---

## 🌐 Publikasi ke GitHub Pages (Otomatis)

Project ini sudah dilengkapi sistem auto-deploy menggunakan GitHub Actions untuk GitHub Pages. Anda **tidak akan mendapati layar blank putih** berkat konfigurasi Vite (`base: "./"`) dan integrasi Error Boundary.

**Cara Aktifkan di GitHub:**
1. Upload/Push semua file proyek ke repository GitHub Anda.
2. Buka Tab **Settings** > **Pages** di repository GitHub Anda.
3. Di bagian **Build and deployment**, ubah "Source" menjadi **GitHub Actions**.
4. Selesai! Tunggu GitHub menjalankan proses (cek tab Actions). Jika hijau, halaman web Anda bisa langsung dikunjungi.

---

## 📜 Lisensi

Aplikasi ini didistribusikan di bawah lisensi [MIT](LICENSE). Anda bebas untuk menggunakan, memodifikasi, dan mendistribusikan proyek ini untuk kepentingan pribadi maupun komersial.

## 🤝 Berkontribusi

Silakan ajukan Issue jika menemukan bug/masalah atau Pull Request jika ingin menambahkan fitur baru! Setiap kontribusi sangat dihargai.
