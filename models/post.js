const { getDb } = require('./db');

// Kategorideki gönderileri al
function getPostsByCategory(categoryId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.category_id = ? AND p.deleted = 0 ORDER BY p.created_at DESC', [categoryId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

// Gönderi oluştur
function createPost(categoryId, userId, title, content) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('INSERT INTO posts (category_id, user_id, title, content) VALUES (?, ?, ?, ?)', [categoryId, userId, title, content], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
      db.close();
    });
  });
}

// Gönderiyi al
function getPostById(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ? AND p.deleted = 0', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
      db.close();
    });
  });
}

// Gönderiyi sil
function deletePost(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('UPDATE posts SET deleted = 1 WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
      db.close();
    });
  });
}

module.exports = {
  getPostsByCategory,
  createPost,
  getPostById,
  deletePost
};