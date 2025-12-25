const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const rateLimit = require('express-rate-limit');
const winston = require('winston');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const moment = require('moment-timezone');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Logger kurulumu
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, 'logs', 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(__dirname, 'logs', 'combined.log') })
  ]
});

// IP whitelist (dev için localhost)
const allowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

app.use((req, res, next) => {
  if (!allowedIPs.includes(req.ip)) {
    logger.warn(`Unauthorized IP access: ${req.ip}`);
    return res.status(403).send('Erişim reddedildi');
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 101, // IP başına 101 istek
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.'
});
app.use(limiter);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.set('trust proxy', 1);
app.use(session({
  secret: 'aloduna-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  cookie: { secure: false } // Dev için false
}));

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware: Kullanıcı oturumu
app.use(async (req, res, next) => {
  if (!req.session.userId && req.path !== '/moderator/login') {
    // Anonim kullanıcı oluştur
    const { createAnonymousUser } = require('./models/user');
    try {
      const user = await createAnonymousUser(req.ip);
      req.session.userId = user.id;
      req.session.user = user;
    } catch (err) {
      console.error(err);
    }
  } else if (req.session.userId) {
    const { getUserById } = require('./models/user');
    try {
      req.session.user = await getUserById(req.session.userId);
    } catch (err) {
      console.error(err);
    }
  }
  next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/moderator', require('./routes/moderator'));
app.use('/legal', require('./routes/legal'));

// Socket.io for DM
io.on('connection', (socket) => {
  console.log('Kullanıcı bağlandı');

  socket.on('sendDM', async (data) => {
    const { sendDM, areFriends } = require('./models/dm');
    const { areFriends: checkFriends } = require('./models/friendship');
    try {
      const isFriend = await checkFriends(data.senderId, data.receiverId);
      if (isFriend) {
        await sendDM(data.senderId, data.receiverId, data.content);
        io.emit('newDM', data); // Tüm kullanıcılara gönder (basitlik için)
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Kullanıcı ayrıldı');
  });
});

// Port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});