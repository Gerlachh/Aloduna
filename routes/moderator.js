const express = require('express');
const router = express.Router();
const { verifyModeratorPassword, loginModerator, banUser, muteUser } = require('../models/user');
const { deleteCategory } = require('../models/category');
const { deletePost } = require('../models/post');
const { deleteComment } = require('../models/comment');
const { deleteDM } = require('../models/dm');
const { getAllReports, deleteReport } = require('../models/report');
const { getAllLogs } = require('../models/log');

// Moderatör giriş sayfası
router.get('/login', (req, res) => {
  res.render('moderator-login', { error: null });
});

// Moderatör giriş
router.post('/login', async (req, res) => {
  const { password, nickname } = req.body;
  if (!verifyModeratorPassword(password)) {
    return res.render('moderator-login', { error: 'Geçersiz şifre' });
  }
  try {
    const mod = await loginModerator(nickname, req.ip);
    req.session.userId = mod.id;
    req.session.user = mod;
    res.redirect('/moderator');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Moderatör paneli
router.get('/', (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  res.render('moderator', { user: req.session.user });
});

// Kategori sil
router.post('/delete-category', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  const { id } = req.body;
  try {
    await deleteCategory(id);
    res.redirect('/moderator');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Gönderi sil
router.post('/delete-post', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  const { id } = req.body;
  try {
    await deletePost(id);
    res.redirect('/moderator');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Yorum sil
router.post('/delete-comment', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  const { id } = req.body;
  try {
    await deleteComment(id);
    res.redirect('/moderator');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// DM sil
router.post('/delete-dm', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  const { id } = req.body;
  try {
    await deleteDM(id);
    res.redirect('/moderator');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Kullanıcı banla
router.post('/ban-user', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  const { userId } = req.body;
  try {
    await banUser(userId, req.session.userId);
    res.redirect('/moderator');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Kullanıcı sustur
router.post('/mute-user', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  const { userId, until } = req.body;
  try {
    await muteUser(userId, until, req.session.userId);
    res.redirect('/moderator');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Raporlar sayfası
router.get('/reports', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  try {
    const reports = await getAllReports();
    res.render('moderator-reports', { reports, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Rapor sil
router.post('/delete-report', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  const { id } = req.body;
  try {
    await deleteReport(id);
    res.redirect('/moderator/reports');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Loglar sayfası
router.get('/logs', async (req, res) => {
  if (!req.session.user || !req.session.user.is_moderator) {
    return res.redirect('/moderator/login');
  }
  try {
    const logs = await getAllLogs();
    res.render('moderator-logs', { logs, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Çıkış
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;