const { getDb } = require('./db');

// Arkadaşlık isteği gönder
function sendFriendRequest(requesterId, addresseeId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('INSERT INTO friendships (requester_id, addressee_id) VALUES (?, ?)', [requesterId, addresseeId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
      db.close();
    });
  });
}

// Arkadaşlık isteklerini al
function getFriendRequests(userId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT f.*, u.username FROM friendships f JOIN users u ON f.requester_id = u.id WHERE f.addressee_id = ? AND f.status = "pending"', [userId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
      db.close();
    });
  });
}

// Arkadaşlık isteğini kabul et
function acceptFriendRequest(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('UPDATE friendships SET status = "accepted" WHERE id = ?', [id], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
      db.close();
    });
  });
}

// Arkadaşları al
function getFriends(userId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const query = `
      SELECT u.id, u.username FROM users u
      JOIN friendships f ON (f.requester_id = u.id OR f.addressee_id = u.id)
      WHERE (f.requester_id = ? OR f.addressee_id = ?) AND f.status = "accepted" AND u.id != ?
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

// İki kullanıcı arkadaş mı?
function areFriends(userId1, userId2) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    const query = `
      SELECT COUNT(*) as count FROM friendships
      WHERE ((requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?))
      AND status = "accepted"
    `;
    db.get(query, [userId1, userId2, userId2, userId1], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count > 0);
      }
      db.close();
    });
  });
}

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  getFriends,
  areFriends
};