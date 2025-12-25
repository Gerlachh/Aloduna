const express = require('express');
const router = express.Router();

// Gizlilik Politikası
router.get('/gizlilik-politikasi', (req, res) => {
  res.render('gizlilik-politikasi');
});

// Kullanıcı Sözleşmesi
router.get('/kullanici-sozlesmesi', (req, res) => {
  res.render('kullanici-sozlesmesi');
});

// Topluluk Kuralları
router.get('/topluluk-kurallari', (req, res) => {
  res.render('topluluk-kurallari');
});

module.exports = router;