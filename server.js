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
  '/createUser': ['*'],
  '/issueProduct': ['*', 'issue'],
  '/users': ['*'],
  '/employees': ['*', 'read'],
  '/sessions': ['*'],
  '/products': ['*', 'read'],
  '/acceptances': ['*', 'accept'],
  '/issuances': ['*', 'issue'],
  '/sectors': ['*', 'read'],
  '/admin': ['*'],
  '/createEmployee': ['*'],
  '/deleteEmployee': ['*'],
  '/api/employee/delete': ['*'],
  '/api/employee/update': ['*'],
  '/api/employee/create': ['*'],
  '/api/user/create': ['*'],
  '/api/user/update': ['*'],
  '/api/user/delete': ['*'],
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
  const users = await db.getAllUsers()
  res.render('pages/createUser', {
    message: req.query.message || '',
    username: req.user?.username,
    users: users,
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

app.post('/api/user/update', async (req, res) => {
  try {
    const result = await db.updateUser(req.body, req);
    res.redirect('/createUser?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/deleteUser', async (req, res) => {
  const users = await db.getAllUsers()
  res.render('pages/deleteUser', {
    message: req.query.message || '',
    username: req.user?.username,
    users: users,
  });
})

app.post('/api/user/delete', async (req, res) => {
  try {
    const result = await db.deleteUser(req.body, req);
    res.redirect('/deleteUser?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/createEmployee', async (req, res) => {
  const employees = await db.getAllEmployees()
  res.render('pages/createEmployee', {
    message: req.query.message || '',
    username: req.user?.username,
    employees: employees,
  });
})

app.post('/api/employee/create', async (req, res) => {
  try {
    const result = await db.addEmployee(req.body, req);
    res.redirect('/createEmployee?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.post('/api/employee/update', async (req, res) => {
  try {
    const result = await db.updateEmployee(req.body, req);
    res.redirect('/createEmployee?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/deleteEmployee', async (req, res) => {
  const employees = await db.getAllEmployees()
  res.render('pages/deleteEmployee', {
    message: req.query.message || '',
    username: req.user?.username,
    employees: employees,
  });
})

app.post('/api/employee/delete', async (req, res) => {
  try {
    const result = await db.deleteEmployee(req.body, req);
    res.redirect('/deleteEmployee?message=' + result.message)
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

app.get('/admin', async (req, res) => {
  res.render('pages/admin', {
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

app.get('/createSectors', async (req, res) => {
  const sectors = await db.getAllSectors()
  res.render('pages/createSectors', {
    message: req.query.message || '',
    username: req.user?.username,
    sectors: sectors,
  });
})

app.post('/api/sectors/create', async (req, res) => {
  try {
    const result = await db.createSectors(req.body, req);
    res.redirect('/createSectors?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/updateSectors', async (req, res) => {
  const sectors = await db.getAllSectors()
  res.render('pages/updateSectors', {
    message: req.query.message || '',
    username: req.user?.username,
    sectors: sectors,
  });
})

app.post('/api/sectors/update', async (req, res) => {
  try {
    const result = await db.updateSectors(req.body, req);
    res.redirect('/updateSectors?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/deleteSectors', async (req, res) => {
  const sectors = await db.getAllSectors()
  res.render('pages/deleteSectors', {
    message: req.query.message || '',
    username: req.user?.username,
    sectors: sectors,
  });
})

app.post('/api/sectors/delete', async (req, res) => {
  try {
    const result = await db.deleteSectors(req.body, req);
    res.redirect('/deleteSectors?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
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
  const productsId = req.query?.productsId;
  const products = productsId ? await db.getProductById(productsId) : await db.getAllProducts()
  res.render('pages/products', {
    products: products,
    username: req.user?.username,
  });
});

app.get('/createProducts', async (req, res) => {
  const products = await db.getAllProducts()
  res.render('pages/createProducts', {
    message: req.query.message || '',
    username: req.user?.username,
    products: products,
  });
})

app.post('/api/products/create', async (req, res) => {
  try {
    const result = await db.createProducts(req.body, req);
    res.redirect('/createProducts?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/updateProducts', async (req, res) => {
  const products = await db.getAllProducts()
  res.render('pages/updateProducts', {
    message: req.query.message || '',
    username: req.user?.username,
    products: products,
  });
})

app.post('/api/products/update', async (req, res) => {
  try {
    const result = await db.updateProducts(req.body, req);
    res.redirect('/updateProducts?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/deleteProducts', async (req, res) => {
  const products = await db.getAllProducts()
  res.render('pages/deleteProducts', {
    message: req.query.message || '',
    username: req.user?.username,
    products: products,
  });
})

app.post('/api/products/delete', async (req, res) => {
  try {
    const result = await db.deleteProducts(req.body, req);
    res.redirect('/deleteProducts?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/findByNominations', async function (req, res) {
  const nominations = req.query?.nominations;
  const products = nominations ? await db.getProductByNomination(nominations) : await db.getAllProducts()
  res.render('pages/products', {
    products: products,
    username: req.user?.username,
  });
});

app.get('/findBySectorId', async function (req, res) {
  const SectorsId = req.query?.SectorsId;
  const products = SectorsId ? await db.getProductBySector(SectorsId) : await db.getAllProducts()
  res.render('pages/products', {
    products: products,
    username: req.user?.username,
  });
});

app.get('/sessions', async function (req, res) {
  const sessionId = req.query?.sessionId;
  const sessions = sessionId ? await db.getSessionById(sessionId) : await db.getAllSessions()
  res.render('pages/sessions', {
    sessions: sessions,
    username: req.user?.username,
  });
});

app.get('/deleteSessions', async (req, res) => {
  const sessions = await db.getAllSessions()
  res.render('pages/deleteSessions', {
    message: req.query.message || '',
    username: req.user?.username,
    sessions: sessions,
  });
})

app.post('/api/sessions/delete', async (req, res) => {
  try {
    const result = await db.deleteSessions(req.body, req);
    res.redirect('/deleteSessions?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/acceptances', async function (req, res) {
  const acceptances = await db.getAllAcceptances()
  res.render('pages/acceptances', {
    acceptances: acceptances,
    username: req.user?.username,
  });
});

app.get('/deleteAcceptances', async (req, res) => {
  const acceptances = await db.getAllAcceptances()
  res.render('pages/deleteAcceptances', {
    message: req.query.message || '',
    username: req.user?.username,
    acceptances: acceptances,
  });
})

app.get('/updateAcceptances', async (req, res) => {
  const acceptances = await db.getAllAcceptances()
  res.render('pages/updateAcceptances', {
    message: req.query.message || '',
    username: req.user?.username,
    acceptances: acceptances,
  });
})

app.post('/api/acceptances/update', async (req, res) => {
  try {
    const result = await db.updateAcceptances(req.body, req);
    res.redirect('/updateAcceptances?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.post('/api/acceptances/delete', async (req, res) => {
  try {
    const result = await db.deleteAcceptances(req.body, req);
    res.redirect('/deleteAcceptances?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/findByDateAccept', async function (req, res) {
  const dateAccept = req.query?.dateAccept;
  const acceptances = dateAccept ? await db.getByDateAccept(dateAccept) : await db.getAllAcceptances()
  res.render('pages/acceptances', {
    acceptances: acceptances,
    username: req.user?.username,
  });
});

app.get('/findAcceptEmployeeId', async function (req, res) {
  const employeeId = req.query?.employeeId;
  const acceptances = employeeId ? await db.getByAcceptEmployeeId(employeeId) : await db.getAllAcceptances()
  res.render('pages/acceptances', {
    acceptances: acceptances,
    username: req.user?.username
  });
});

app.get('/findIssueEmployeeId', async function (req, res) {
  const employeeId = req.query?.employeeId;
  const issuances = employeeId ? await db.getByIssueEmployeeId(employeeId) : await db.getAllIssuances()
  res.render('pages/issuances', {
    issuances: issuances,
    username: req.user?.username,
  });
});

app.get('/issuances', async function (req, res) {
  const issuances = await db.getAllIssuances()
  res.render('pages/issuances', {
    issuances: issuances,
    username: req.user?.username,
  });
});

app.get('/deleteIssuances', async (req, res) => {
  const issuances = await db.getAllIssuances()
  res.render('pages/deleteIssuances', {
    message: req.query.message || '',
    username: req.user?.username,
    issuances: issuances,
  });
})

app.get('/updateIssuances', async (req, res) => {
  const issuances = await db.getAllIssuances()
  res.render('pages/updateIssuances', {
    message: req.query.message || '',
    username: req.user?.username,
    issuances: issuances,
  });
})

app.post('/api/issuances/update', async (req, res) => {
  try {
    const result = await db.updateIssuances(req.body, req);
    res.redirect('/updateIssuances?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.post('/api/issuances/delete', async (req, res) => {
  try {
    const result = await db.deleteIssuances(req.body, req);
    res.redirect('/deleteIssuances?message=' + result.message)
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.get('/findByDateIssue', async function (req, res) {
  const dateIssue = req.query?.dateIssue;
  const issuances = dateIssue ? await db.getByDateIssue(dateIssue) : await db.getAllIssuances()
  res.render('pages/issuances', {
    issuances: issuances,
    username: req.user?.username,
  });
});


/** Запускаем сервер */
app.listen(port, () => {
  console.log(`Сервер запущен по адресу http://localhost:${port}`)
})