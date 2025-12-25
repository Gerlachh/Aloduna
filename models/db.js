const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı dosyasının yolu
const dbPath = path.join(__dirname, '..', 'aloduna.db');

// Veritabanı bağlantısını döndüren fonksiyon
function getDb() {
  return new sqlite3.Database(dbPath);
}

module.exports = { getDb };