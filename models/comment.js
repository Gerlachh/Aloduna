const { getDb } = require('./db');

// Gönderideki yorumları al (iç içe için recursive)
function getCommentsByPost(postId) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.all('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? AND c.deleted = 0 ORDER BY c.created_at ASC', [postId], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        // İç içe yapı için düzenle
        const comments = [];
        const map = {};
        rows.forEach(row => {
          map[row.id] = row;
          row.replies = [];
          if (!row.parent_id) {
            comments.push(row);
          } else {
            if (map[row.parent_id]) {
              map[row.parent_id].replies.push(row);
            }
          }
        });
        resolve(comments);
      }
      db.close();
    });
  });
}

// Yorum oluştur
function createComment(postId, userId, content, parentId = null) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)', [postId, userId, content, parentId], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
      db.close();
    });
  });
}

// Yorumu sil
function deleteComment(id) {
  return new Promise((resolve, reject) => {
    const db = getDb();
    db.run('UPDATE comments SET deleted = 1 WHERE id = ?', [id], (err) => {
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
  getCommentsByPost,
  createComment,
  deleteComment
};