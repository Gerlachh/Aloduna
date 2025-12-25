const { getDb } = require('./db');

// Rapor oluştur
function createReport(reporterId, targetType, targetId, reason) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)', [reporterId, targetType, targetId, reason], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
      db.close();
    });
  });
}

// Tüm raporları al (moderatör için)
function getAllReports() {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT r.*, u.username as reporter_username FROM reports r JOIN users u ON r.reporter_id = u.id ORDER BY r.created_at DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

// Raporu sil
function deleteReport(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('DELETE FROM reports WHERE id = ?', [id], (err) => {
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
  createReport,
  getAllReports,
  deleteReport
};