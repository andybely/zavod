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
const Roles = {
  '/acceptProduct': ['*', 'accept'],
  '/api/user/create': ['*'],
  '/createUser': ['*'], 
  '/issueProduct': ['*', 'issue'],
  '/users': ['*', 'read'],
  '/employees': ['*'], 
  '/sessions': ['*'], 
  '/products': ['*', 'read'], 
  '/acceptances': ['*', 'accept'],  
  '/issuances': ['*', 'issue'],  
  '/sectors': ['*', 'read'],  
}

app.use(async (req, res, next) => {
  const role = req.user?.role.roleAccess || ''
  if (Roles[req.originalUrl]) {
    const userRoles = role.split(',');
    for (const needRole of Roles[req.originalUrl]) {
      if (userRoles.find((userRole) => userRole === needRole)) return next();
    }
    return res.redirect('/?message=Access Denied');
  }
  return next();
})

/** Прописываем роуты. Т.е. при переходе на страницу, какую показывать пользователю */
app.get('/', async (req, res) => {
  res.render('pages/index', {
    message: req.query.message || '',
    username: req.user?.username,
  });
})

app.get('/logout', async (req, res) => {
  res.cookie('session', '');
  res.redirect('/')
  await db.deleteSession(req);
})

app.get('/createUser', async (req, res) => {
  res.render('pages/createUser', {
    message: req.query.message || '',
    username: req.user?.username,
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

app.get('/acceptProduct', async (req, res) => {
  const products = await db.getAllProducts()
  const employees = await db.getAllEmployees() 
  res.render('pages/acceptProduct', {
    message: req.query.message || '',
    products: products,
    employees: employees,
    username: req.user?.username,
  });
})

app.post('/product/accept', async (req, res) => {
  try {
    const result = await db.acceptProduct(req.body, req);
    res.redirect('/acceptProduct?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/issueProduct', async (req, res) => {
  const products = await db.getAllProducts()
  const employees = await db.getAllEmployees() 
  res.render('pages/issueProduct', {
    message: req.query.message || '',
    products: products,
    employees: employees,
    username: req.user?.username,
  });
})

app.post('/product/issue', async (req, res) => {
  try {
    const result = await db.issueProduct(req.body, req);
    res.redirect('/issueProduct?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/login', async (req, res) => {
  res.render('pages/login', {
    message: req.query.message || '',
    username: req.user?.username,
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
  const usersId = req.query?.usersId;
  const users = usersId ? await db.getUsersById(usersId) : await db.getAllUsers()
  res.render('pages/users', {
    users: users,
    username: req.user?.username,
  });
});

app.get('/sectors', async function (req, res) {
  const sectorId = req.query?.sectorId;
  const sectors = sectorId ? await db.getSectorById(sectorId) : await db.getAllSectors()
  res.render('pages/sectors', {
    sectors: sectors,
    username: req.user?.username,
  });
});

app.get('/employees', async function (req, res) {
  const surnames = req.query?.surnames;
  const employees = surnames ? await db.getEmployeeBySurname(surnames) : await db.getAllEmployees()
  res.render('pages/employees', {
    employees: employees,
    username: req.user?.username,
  });
});

app.get('/products', async function (req, res) {
  const products = await db.getAllProducts()
  res.render('pages/products', {
    products: products,
    username: req.user?.username,
  });
});

app.get('/sessions', async function (req, res) {
  const sessions = await db.getAllSessions()
  res.render('pages/sessions', {
    sessions: sessions,
    username: req.user?.username,
  });
});

app.get('/acceptances', async function (req, res) {
  const acceptances = await db.getAllAcceptances()
  res.render('pages/acceptances', {
    acceptances: acceptances,
    username: req.user?.username
  });
});

app.get('/issuances', async function (req, res) {
  const issuances = await db.getAllIssuances()
  res.render('pages/issuances', {
    issuances: issuances,
    username: req.user?.username,
  });
});

app.get('/sectors', async function (req, res) {
  const sectorId = req.query?.sectorId;
  const sectors = sectorId ? await db.getSectorById(sectorId) : await db.getAllSectors()
  res.render('pages/sectors', {
    sectors: sectors,
    username: req.user?.username,
  });
});


/** Запускаем сервер */
app.listen(port, () => {
  console.log(`Сервер запущен по адресу http://localhost:${port}`)
})