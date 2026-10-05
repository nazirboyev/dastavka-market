# Sifat Market

Onlayn mahsulot do'koni — Uzum Market uslubidagi mobil-first veb-sayt.

## Imkoniyatlar

### Foydalanuvchi paneli
- **Asosiy** — qidiruv, aylanib turadigan reklama rasmlari (5-6 ta), eng ko'p sotilgan va chegirmadagi mahsulotlar
- **Qidiruv** — yozilgan harflarga mos mahsulotlarni real vaqtda qidirish
- **Savat** — mahsulot qo'shish, miqdor o'zgartirish, Google xaritadan joylashuv tanlash, buyurtma berish
- **Profil** — kirish/ro'yxatdan o'tish, buyurtmalarim, dasturchilar bilan bog'lanish, til o'zgartirish (UZ/RU/EN)

### Admin paneli
- **Login:** `sifatmarket` | **Parol:** `IsmoiljonXudoshukur09`
- Reklama rasmlarini boshqarish (qo'shish/o'zgartirish/o'chirish)
- Mahsulot qo'shish (rasm, nom, narx, chegirma, tavsif)
- Buyurtmalarni ko'rish, joylashuvni Google Maps marshruti bilan ochish
- Kuryer 50m yaqinida bo'lganda "Yetkazildi" tugmasi
- Mijozlar bilan Telegram uslubidagi chat

## O'rnatish

```bash
# Barcha paketlarni o'rnatish
npm run install:all

# Google Maps API kalitini sozlash (ixtiyoriy)
# client/.env fayl yarating:
# VITE_GOOGLE_MAPS_KEY=sizning_google_maps_api_kalitingiz

# Server va clientni bir vaqtda ishga tushirish
npm install
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

## Texnologiyalar

- **Frontend:** React, TypeScript, Vite, React Router
- **Backend:** Node.js, Express, WebSocket (real-time yangilanishlar)
- **Xarita:** Google Maps API
- **Saqlash:** JSON fayl + rasm yuklash

## Struktura

```
├── client/          # React frontend
│   └── src/
│       ├── pages/       # Foydalanuvchi va admin sahifalar
│       ├── components/  # UI komponentlar
│       ├── context/     # Global state
│       └── i18n.ts      # 3 til (UZ, RU, EN)
├── server/          # Express backend
│   ├── index.js     # API + WebSocket
│   ├── data.json    # Ma'lumotlar bazasi
│   └── uploads/     # Yuklangan rasmlar
└── package.json
```
