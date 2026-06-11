Proyek Text-to-Speech AI

# 🔊 Text-to-Speech (TTS) AI Hub

Aplikasi utilitas front-end interaktif yang dirancang untuk mengonversi data tekstual menjadi output audio vokal berkualitas tinggi secara instan memanfaatkan protokol native Speech API.

## ⚡ Fitur Utama
- **Native Speech Synthesis**: Menggunakan Web Speech API bawaan browser modern, menghasilkan pemrosesan audio berlatensi rendah tanpa ketergantungan server eksternal.
- **Character Constraint Validation**: Validasi batas input dinamis hingga 2.000 karakter secara *real-time* untuk optimalisasi alokasi memori browser.
- **State Control Mechanism**: Fitur pembersihan instan (Reset State) yang otomatis menghentikan antrean pemutaran audio (*speech queue*) saat tombol ditekan.

## 💻 Spesifikasi Teknis
- **UI Styling:** Tailwind CSS dengan implementasi skema gradasi warna ungu-violet yang elegan.
- **Logic Controller:** Vanilla JavaScript asinkron dengan pemanfaatan objek global `window.speechSynthesis`.
