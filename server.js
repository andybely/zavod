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
// app.get('/login', async (req, res) => {
//   res.render('pages/login');
// })

app.get('/logout', async (req, res) => {
  res.cookie('session', '');
  res.redirect('/')
  await db.deleteSession(req);
})

/** :( */
app.get('/createUser', async (req, res) => {
  res.render('pages/createUser', {
    message: req.query.message || ''
  });
})


app.post('/api/user/create', async (req, res) => {
  try {
    const result = await db.addUser(req.body, req);// { message: "Пользователь добавлен! " + body.username };
    res.redirect('/createUser?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});


app.get('/login', async (req, res) => {
  res.render('pages/login', {
    message: req.query.message || ''
  });
})


app.post('/auth/login', async (req, res) => {

  try {
    const session = await db.login(req.body, req);
    res.cookie('session', session.id);
    if (session.message == "Сессия создана") {
      res.redirect('/?message=' + session.message)
    }
    else {
      res.redirect('/login?message=' + session.message)
    }

  } catch (e) {
    res.redirect('/')
    res.send({ error: e.message });
  }

});



app.get('/users', async function (req, res) {
  const users = await db.getAllUsers()
  //res.send(users)
  res.render('pages/users', {
    users: users,
  });
});

app.get('/employees', async function (req, res) {
  const employees = await db.getAllEmployees()
  //res.send(employees)
  res.render('pages/employees', {
    employees: employees,
  });
});

app.get('/products', async function (req, res) {
  const products = await db.getAllProducts()
  res.render('pages/products', {
    products: products,
  });
});

app.get('/sessions', async function (req, res) {
  const sessions = await db.getAllSessions()
  res.render('pages/sessions', {
    sessions: sessions,
  });
});

app.get('/sessions', async function (req, res) {
  const sessions = await db.getAllSessions()
  res.render('pages/sessions', {
    sessions: sessions,
  });
});

app.get('/sessions', async function (req, res) {
  const sessions = await db.getAllSessions()
  res.render('pages/sessions', {
    sessions: sessions,
  });
});

app.get('/acceptances', async function (req, res) {
  const acceptances = await db.getAllAcceptances()
  res.render('pages/acceptances', {
    acceptances: acceptances,
  });
});

app.get('/issuances', async function (req, res) {
  const issuances = await db.getAllIssuances()
  res.render('pages/issuances', {
    issuances: issuances,
  });
});

app.get('/sectors', async function (req, res) {
  const sectors = await db.getAllSectors()
  res.render('pages/sectors', {
    sectors: sectors,
  });
});


/** Запускаем сервер */
app.listen(port, () => {
  console.log(`Сервер запущен по адресу http://localhost:${port}`)
})