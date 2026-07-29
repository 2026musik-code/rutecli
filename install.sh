#!/bin/bash

echo -e "\e[1;32m[+]\e[0m Memulai instalasi Xray Orchestrator di Termux..."

# 1. Update dan Upgrade sistem Termux
echo -e "\e[1;34m[*]\e[0m Memperbarui package Termux..."
pkg update -y && pkg upgrade -y

# 2. Install dependensi yang dibutuhkan (Node.js, Git, Wget, Unzip)
echo -e "\e[1;34m[*]\e[0m Menginstal dependensi inti (Node.js, Git, Wget, Unzip)..."
pkg install nodejs git wget unzip -y

# 3. Clone Repository
echo -e "\e[1;34m[*]\e[0m Mengunduh repository..."
# Menghapus folder lama jika ada agar tidak error
rm -rf rutecli
git clone https://github.com/2026musik-code/rutecli.git
cd rutecli

# 4. Mengunduh Xray-core Binary langsung dari GitHub ke dalam folder rutecli
echo -e "\e[1;34m[*]\e[0m Mengunduh Xray-core..."
mkdir -p xray-core
cd xray-core
# Download binary untuk android arm64
wget -q -O xray.zip https://github.com/XTLS/Xray-core/releases/latest/download/Xray-linux-arm64-v8a.zip
unzip -o xray.zip xray
mv xray ../
cd ..
rm -rf xray-core
chmod +x xray
echo -e "\e[1;32m[+]\e[0m Xray-core berhasil disiapkan."

# 5. Mengubah Port Localhost menjadi 20111
echo -e "\e[1;34m[*]\e[0m Mengonfigurasi port ke 20111..."
sed -i 's/const PORT = 3000;/const PORT = 20111;/g' server.ts

# 6. Install NPM Dependencies
echo -e "\e[1;34m[*]\e[0m Menginstal modul Node.js..."
npm install

# 7. Build aplikasi (Vite + React)
echo -e "\e[1;34m[*]\e[0m Membangun Local Web Dashboard..."
npm run build

# 8. Selesai dan Jalankan
echo -e "\e[1;32m[+]\e[0m Instalasi Selesai!"
echo -e "\e[1;32m[+]\e[0m Menjalankan Xray Orchestrator pada http://127.0.0.1:20111 ..."
npm run start
