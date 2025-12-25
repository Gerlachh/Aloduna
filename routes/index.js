const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, getUserCategoryCountToday } = require('../models/category');
const { getFriendsNotes } = require('../models/note');
const { getFriends, sendFriendRequest, acceptFriendRequest, areFriends } = require('../models/friendship');
const { sendDM, getDMs } = require('../models/dm');
const { createReport } = require('../models/report');
const { getPostsByCategory, createPost, getPostById } = require('../models/post');
const { getCommentsByPost, createComment } = require('../models/comment');
const { setNote } = require('../models/note');

// Ana sayfa
router.get('/', async (req, res) => {
  try {
    const categories = await getAllCategories();
    let notes = [];
    if (req.session.userId) {
      notes = await getFriendsNotes(req.session.userId);
    }
    res.render('index', { categories, notes, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Kategori oluştur
router.post('/category', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  const { name } = req.body;
  if (!name) {
    return res.redirect('/');
  }
  try {
    const count = await getUserCategoryCountToday(req.session.userId);
    if (count >= 2) {
      return res.redirect('/');
    }
    await createCategory(name, req.session.userId);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Kategori sayfası
router.get('/category/:id', async (req, res) => {
  try {
    const posts = await getPostsByCategory(req.params.id);
    res.render('category', { posts, categoryId: req.params.id, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Gönderi oluştur
router.post('/post', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  const { categoryId, title, content } = req.body;
  if (!title || !content) {
    return res.redirect(`/category/${categoryId}`);
  }
  try {
    await createPost(categoryId, req.session.userId, title, content);
    res.redirect(`/category/${categoryId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Gönderi sayfası
router.get('/post/:id', async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    if (!post) {
      return res.status(404).send('Gönderi bulunamadı');
    }
    const comments = await getCommentsByPost(req.params.id);
    res.render('post', { post, comments, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Yorum oluştur
router.post('/comment', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  const { postId, content, parentId } = req.body;
  if (!content) {
    return res.redirect(`/post/${postId}`);
  }
  try {
    await createComment(postId, req.session.userId, content, parentId);
    res.redirect(`/post/${postId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Notlar sayfası
router.get('/notes', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  try {
    const notes = await getFriendsNotes(req.session.userId);
    res.render('notes', { notes, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Not oluştur
router.post('/note', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/notes');
  }
  const { content } = req.body;
  if (!content || content.length > 60) {
    return res.redirect('/notes');
  }
  try {
    await setNote(req.session.userId, content);
    res.redirect('/notes');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// DM sayfası
router.get('/dm', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  try {
    const friends = await getFriends(req.session.userId);
    const dms = await getDMs(req.session.userId);
    res.render('dm', { friends, dms, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// DM gönder
router.post('/dm', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/dm');
  }
  const { receiverId, content } = req.body;
  if (!content) {
    return res.redirect('/dm');
  }
  try {
    const isFriend = await areFriends(req.session.userId, receiverId);
    if (!isFriend) {
      return res.redirect('/dm');
    }
    await sendDM(req.session.userId, receiverId, content);
    res.redirect('/dm');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Arkadaşlık isteği gönder
router.post('/friend-request', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  const { addresseeId } = req.body;
  try {
    await sendFriendRequest(req.session.userId, addresseeId);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Arkadaşlık isteklerini kabul et
router.post('/accept-friend', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  const { requestId } = req.body;
  try {
    await acceptFriendRequest(requestId);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// Rapor oluştur
router.post('/report', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  const { targetType, targetId, reason } = req.body;
  try {
    await createReport(req.session.userId, targetType, targetId, reason);
    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// DM sayfası
router.get('/dm', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  try {
    const friends = await getFriends(req.session.userId);
    res.render('dm', { friends, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

// DM gönder
router.post('/dm/send', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  const { receiverId, content } = req.body;
  if (!content || !receiverId) {
    return res.redirect('/dm');
  }
  try {
    const isFriend = await areFriends(req.session.userId, receiverId);
    if (!isFriend) {
      return res.redirect('/dm');
    }
    await sendDM(req.session.userId, receiverId, content);
    res.redirect('/dm');
  } catch (err) {
    console.error(err);
    res.status(500).send('Sunucu hatası');
  }
});

module.exports = router;