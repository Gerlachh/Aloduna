const { getDb } = require('./db');

// Log ekle
function addLog(moderatorId, action, details) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('INSERT INTO logs (moderator_id, action, details) VALUES (?, ?, ?)', [moderatorId, action, details], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
      db.close();
    });
  });
}

// Tüm logları al
function getAllLogs() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT l.*, u.username FROM logs l JOIN users u ON l.moderator_id = u.id ORDER BY l.created_at DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

module.exports = {
  addLog,
  getAllLogs
};