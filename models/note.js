const { getDb } = require('./db');

// Not oluştur veya güncelle
function setNote(userId, content) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat sonra
    db.run('INSERT OR REPLACE INTO notes (user_id, content, expires_at) VALUES (?, ?, ?)', [userId, content, expiresAt.toISOString()], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
      db.close();
    });
  });
}

// Kullanıcının arkadaşlarının notlarını al
function getFriendsNotes(userId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const query = `
      SELECT n.*, u.username FROM notes n
      JOIN users u ON n.user_id = u.id
      JOIN friendships f ON (f.requester_id = u.id OR f.addressee_id = u.id)
      WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = "accepted" AND u.id != ?
      AND n.expires_at > datetime('now')
      ORDER BY n.created_at DESC
    `;
    db.all(query, [userId, userId, userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

// Notu sil
function deleteNote(userId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('DELETE FROM notes WHERE user_id = ?', [userId], (err) => {
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
  setNote,
  getFriendsNotes,
  deleteNote
};