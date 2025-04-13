const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const app = express();


mongoose.connect('mongodb://localhost:27017/eco_auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
}));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'eco_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

app.use((req, res, next) => {
  res.locals.flash = req.flash();
  res.locals.user = req.session.user;
  next();
});

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = user;
    req.flash('success', 'Login successful');
    res.redirect('/dashboard');
  } else {
    req.flash('error', 'Invalid email or password');
    res.redirect('/login');
  }
});

app.get('/signup', (req, res) => res.render('signup'));
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await User.create({ name, email, password: hash });
    req.flash('success', 'Signup successful. Please log in.');
    res.redirect('/login');
  } catch (err) {
    req.flash('error', 'Email already registered');
    res.redirect('/signup');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('dashboard', { name: req.session.user.name });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
