const { getDb } = require('./db');

// DM gönder
function sendDM(senderId, receiverId, content) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('INSERT INTO dms (sender_id, receiver_id, content) VALUES (?, ?, ?)', [senderId, receiverId, content], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
      db.close();
    });
  });
}

// Kullanıcının DM'lerini al
function getDMs(userId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const query = `
      SELECT d.*, u.username as sender_username FROM dms d
      JOIN users u ON d.sender_id = u.id
      WHERE (d.sender_id = ? OR d.receiver_id = ?) AND d.deleted = 0
      ORDER BY d.created_at DESC
    `;
    db.all(query, [userId, userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

// DM'yi sil
function deleteDM(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('UPDATE dms SET deleted = 1 WHERE id = ?', [id], (err) => {
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
  sendDM,
  getDMs,
  deleteDM
};