/** Настройки сервера */
const express = require('express');
const app = express();
const port = 3000;
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')



const Database = require('./database');
const db = new Database({
  database: 'andy',
  username: 'andy',
  password: 'andy',
  host: 'localhost',
  dialect: 'mysql'
});

db.syncronize();

/** Устанавливаем движок рендера, чтобы можно было прямо в страницу загружать данные */
app.set('view engine', 'ejs');

/** Добавляем библиотеки, которые потом будем полключать в страницы */
app.use('/assets', [
  express.static(__dirname + '/node_modules/jquery/dist/'),
  express.static(__dirname + '/assets/'),
]);

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// добавить юзера к запросу
app.use(async (req, res, next) => {
  await db.initializeSession(req);

  return next();
});

/** Прописываем роуты. Т.е. при переходе на страницу, какую показывать пользователю */
app.get('/', async (req, res) => {
  res.render('pages/index', {
    username: req.user?.username,
  });
})

/** :( */
app.get('/login', async (req, res) => {
  res.render('pages/login');
})

app.get('/logout', async (req, res) => {
  res.cookie('session', '');
  res.redirect('/')
  await db.deleteSession(req);
})

/** :( */
app.get('/createUser', async (req, res) => {
  res.render('pages/createUser');
})


app.post('/api/user/create', async (req, res) => {
  try {
    res.send(await db.addUser(req.body, req));
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.post('/auth/login', async (req, res) => {

  try {
    const session = await db.login(req.body);
    res.cookie('session', session.id);
    res.redirect('/')
  } catch (e) {
    res.send({ error: e.message });
  }

});

/** Запускаем сервер */
app.listen(port, () => {
  console.log(`Сервер запущен по адресу http://localhost:${port}`)
})