#!/bin/bash

echo -e "\e[1;32m[+]\e[0m Memulai instalasi Xray Orchestrator di Termux..."

# 1. Update dan Upgrade sistem Termux
echo -e "\e[1;34m[*]\e[0m Memperbarui package Termux..."
pkg update -y && pkg upgrade -y

# 2. Install dependensi yang dibutuhkan (Node.js, Git, Xray)
echo -e "\e[1;34m[*]\e[0m Menginstal dependensi inti (Node.js, Git)..."
pkg install nodejs git -y

# Instalasi Xray (Jika belum ada di repository utama termux, biasanya dari root-repo atau x11-repo)
echo -e "\e[1;34m[*]\e[0m Menginstal Xray-core..."
pkg install root-repo -y
pkg install xray -y || echo -e "\e[1;31m[-]\e[0m Gagal menginstal xray otomatis. Anda mungkin perlu menginstalnya secara manual."

# 3. Clone Repository
echo -e "\e[1;34m[*]\e[0m Mengunduh repository..."
# Menghapus folder lama jika ada agar tidak error
rm -rf rutecli
git clone https://github.com/2026musik-code/rutecli.git
cd rutecli

# 4. Install NPM Dependencies
echo -e "\e[1;34m[*]\e[0m Menginstal modul Node.js..."
npm install

# 5. Build aplikasi (Vite + React)
echo -e "\e[1;34m[*]\e[0m Membangun Local Web Dashboard..."
npm run build

# 6. Selesai dan Jalankan
echo -e "\e[1;32m[+]\e[0m Instalasi Selesai!"
echo -e "\e[1;32m[+]\e[0m Menjalankan Xray Orchestrator..."
npm run start
