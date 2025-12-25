# Aloduna - Anonim Forum ve Sosyal Platform

Aloduna, tamamen anonim bir forum ve sosyal platformdur. Kullanıcılar kayıt olmadan otomatik olarak Anonim#XXXX şeklinde görünür ve 13+ yaş sınırı vardır.

## Özellikler

- **Tamamen Anonim**: Kayıt yok, kullanıcılar otomatik oluşturulur.
- **Kategori Sistemi**: Kullanıcılar günde maksimum 2 kategori oluşturabilir.
- **Gönderi ve Yorumlar**: İç içe yanıtlar, tarih/saat gösterimi.
- **Rapor Sistemi**: Gönderi, yorum, DM ve notlar rapor edilebilir.
- **Instagram Benzeri Notlar**: 24 saatlik notlar, sadece arkadaşlara görünür.
- **Arkadaşlık Sistemi**: Anonim arkadaşlık istekleri.
- **DM (Direkt Mesaj)**: WhatsApp tarzı sohbet, sadece arkadaşlar arasında.
- **Moderatör Paneli**: İçerik yönetimi, ban/mute, rapor inceleme.
- **Tema**: Koyu tema (mor bazlı) varsayılan, açık tema seçeneği.
- **Mobil Dostu**: Responsive tasarım.
- **Türkçe Arayüz**: Tüm metinler Türkçe.

## Kurulum

1. Node.js ve npm yüklü olduğundan emin olun.
2. Projeyi klonlayın:
   ```
   git clone https://github.com/Gerlachh/Aloduna.git
   cd Aloduna
   ```
3. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
4. Veritabanını başlatın:
   ```
   node database/init.js
   ```
5. Sunucuyu başlatın:
   ```
   npm start
   ```
6. Tarayıcıda `http://localhost:3000` adresine gidin.

## Teknoloji

- **Backend**: Node.js, Express.js
- **Veritabanı**: SQLite
- **Frontend**: EJS, CSS, JavaScript
- **Gerçek Zamanlı**: Socket.io (DM için)
- **Diğer**: bcrypt, express-session, winston

## Güvenlik

- IP tabanlı spam koruması
- Rate limiting
- Moderatör IP whitelist
- Şifre korumalı moderatör girişi

## Lisans

Bu proje açık kaynaklıdır. Kullanım için topluluk kurallarına uyunuz.

## İletişim

Sorularınız için GitHub Issues kullanın.