const { getDb } = require('./db');
const bcrypt = require('bcrypt');

// Kullanıcı oluştur (anonim için)
function createAnonymousUser(ip) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    // Anonim kullanıcı adı oluştur
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `Anonim#${randomNum}`;
    db.run('INSERT INTO users (username, ip) VALUES (?, ?)', [username, ip], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, username });
      }
      db.close();
    });
  });
}

// Kullanıcıyı ID ile al
function getUserById(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
      db.close();
    });
  });
}

// Moderatör şifresini doğrula
function verifyModeratorPassword(password) {
  const hashed = bcrypt.hashSync('98765432123456789', 10); // Sabit şifre hash'i
  return bcrypt.compareSync(password, hashed);
}

// Moderatör girişi
function loginModerator(nickname, ip) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const username = nickname || 'Moderatör';
    db.run('INSERT INTO users (username, is_moderator, ip) VALUES (?, 1, ?)', [username, ip], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, username, is_moderator: 1 });
      }
      db.close();
    });
  });
}

// Kullanıcıyı banla
function banUser(userId, moderatorId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('UPDATE users SET banned = 1 WHERE id = ?', [userId], (err) => {
      if (err) {
        reject(err);
      } else {
        // Log ekle
        db.run('INSERT INTO logs (moderator_id, action, details) VALUES (?, ?, ?)', [moderatorId, 'ban', `Kullanıcı ${userId} banlandı`]);
        resolve();
      }
      db.close();
    });
  });
}

// Kullanıcıyı sustur
function muteUser(userId, until, moderatorId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('UPDATE users SET muted_until = ? WHERE id = ?', [until, userId], (err) => {
      if (err) {
        reject(err);
      } else {
        // Log ekle
        db.run('INSERT INTO logs (moderator_id, action, details) VALUES (?, ?, ?)', [moderatorId, 'mute', `Kullanıcı ${userId} susturuldu: ${until}`]);
        resolve();
      }
      db.close();
    });
  });
}

module.exports = {
  createAnonymousUser,
  getUserById,
  verifyModeratorPassword,
  loginModerator,
  banUser,
  muteUser
};