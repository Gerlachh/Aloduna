const { getDb } = require('./db');

// Tüm kategorileri al
function getAllCategories() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT * FROM categories ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

// Kategori oluştur
function createCategory(name, userId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('INSERT INTO categories (name, created_by) VALUES (?, ?)', [name, userId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
      db.close();
    });
  });
}

// Kategoriyi sil (moderatör için)
function deleteCategory(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('DELETE FROM categories WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
      db.close();
    });
  });
}

// Kullanıcının bugün oluşturduğu kategori sayısını al
function getUserCategoryCountToday(userId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];
    db.get('SELECT COUNT(*) as count FROM categories WHERE created_by = ? AND DATE(created_at) = ?', [userId, today], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count);
      }
      db.close();
    });
  });
}

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  getUserCategoryCountToday
};