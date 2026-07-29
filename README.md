# Xray Orchestrator (Termux)

Xray Orchestrator adalah sistem manajemen dan automasi untuk menjalankan berbagai konfigurasi Xray (Vmess, Vless, Trojan, Shadowsocks) secara langsung di Termux Android tanpa akses root. Proyek ini dilengkapi dengan Local Web Dashboard untuk memudahkan pemantauan dan pengelolaan.

## ✨ Fitur Utama

- **Local Web Dashboard**: Kelola semua config melalui browser (UI modern & responsif).
- **Process Manager**: Jalankan dan hentikan instance Xray dengan satu klik.
- **Monitoring Real-time**: Pantau penggunaan Bandwidth (Upload/Download) dan Latency (Ping).
- **Log Viewer**: Lihat log sistem secara langsung dari dashboard.
- **Import Mudah**: Mendukung import JSON mentah ataupun URL konfigurasi (`vmess://`, `vless://`, `trojan://`).
- **Tanpa Root**: Dirancang khusus untuk berjalan sempurna di lingkungan Termux standar.

---

## 🚀 Cara Instalasi (Satu Perintah)

Buka aplikasi **Termux** di HP Android kamu, lalu *Copy & Paste* perintah di bawah ini dan tekan Enter:

```bash
pkg update -y && pkg upgrade -y && pkg install git -y && git clone https://github.com/2026musik-code/rutecli.git && cd rutecli && chmod +x install.sh && ./install.sh
```

**Apa yang dilakukan script ini?**
1. Memperbarui Termux ke versi terbaru.
2. Menginstal `nodejs`, `git`, dan `xray`.
3. Mengkloning repository ini.
4. Menginstal dependensi NPM.
5. Membangun Web Dashboard.
6. Menjalankan server otomatis.

---

## 💻 Cara Menjalankan (Jika sudah diinstal)

Jika kamu sudah pernah menginstalnya dan hanya ingin menjalankannya kembali setelah menutup Termux, gunakan perintah berikut:

```bash
cd rutecli
npm run start
```

---

## 🌐 Cara Mengakses Dashboard

Setelah instalasi selesai atau setelah menjalankan perintah start, server akan berjalan di background.
Buka browser favorit kamu (Chrome, Firefox, Brave, dll) dan akses alamat berikut:

👉 **http://127.0.0.1:20111**  
*(Atau http://localhost:20111)*

---

## ⚙️ Cara Menambahkan Akun Xray

1. Buka Web Dashboard di browser.
2. Buka menu **Instances & Accounts** (ikon Server di menu kiri).
3. Klik tombol **+ Add Config** warna biru di pojok kanan atas.
4. Pilih metode import:
   - **Subscription / URL**: Paste link seperti `vmess://...` atau `vless://...`
   - **Raw JSON**: Paste isi file `config.json` utuh.
5. Klik **Save & Import**.
6. Klik tombol **Play (▶)** pada baris akun tersebut untuk menjalankannya.

---

## ⚠️ Catatan Penting

- **Background Process**: Agar Xray tetap berjalan meskipun kamu membuka aplikasi lain, pastikan Termux tidak dimatikan oleh sistem penghemat baterai (Battery Saver). Buka info aplikasi Termux > Battery > set ke "Unrestricted" (Tidak dibatasi).
- **Xray Core**: Jika instalasi `xray` gagal melalui script karena perbedaan repository Termux, kamu bisa menginstal manual dengan perintah: `pkg install root-repo && pkg install xray`.
