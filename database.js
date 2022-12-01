const { Sequelize } = require('sequelize');

const Employee = require('./models/Employee');
const User = require('./models/User');
const Role = require('./models/Role');
const Session = require('./models/Session');
const Acceptance = require('./models/Acceptance');
const Issuance = require('./models/Issuance');
const Sector = require('./models/Sector');
const Product = require('./models/Product');
const crypto = require("crypto");


class Database {
  #sequelize;
  #user;
  #employee;
  #role;
  #session;
  #acceptance;
  #issuance;
  #sector;
  #product;


  constructor({ database, username, password, host, dialect }) {
    this.#sequelize = new Sequelize(
      database,
      username,
      password, {
      host,
      dialect,
    }
    );

    this.#employee = this.#sequelize.define('Employee', Employee, {
      tableName: 'Employees',
      timestamps: false,
    });

    this.#user = this.#sequelize.define('User', User, {
      tableName: 'Users',
      timestamps: false,
    });

    this.#role = this.#sequelize.define('Role', Role, {
      tableName: 'Roles',
      timestamps: false,
    });

    this.#session = this.#sequelize.define('Session', Session, {
      tableName: 'Sessions',
      timestamps: false,
    });

    this.#acceptance = this.#sequelize.define('Acceptance', Acceptance, {
      tableName: 'Acceptance',
      timestamps: false,
    });

    this.#issuance = this.#sequelize.define('Issuance', Issuance, {
      tableName: 'Issuance',
      timestamps: false,
    });

    this.#sector = this.#sequelize.define('Sector', Sector, {
      tableName: 'Sector',
      timestamps: false,
    });

    this.#product = this.#sequelize.define('Product', Product, {
      tableName: 'Product',
      timestamps: false,
    });


    this.#employee.User = this.#employee.belongsTo(this.#user);
    // this.#employee.Role = this.#employee.belongsTo(this.#role); // перевыдал на юзера
    this.#user.Role = this.#user.belongsTo(this.#role);
    this.#session.User = this.#session.belongsTo(this.#user);

    //дописать
  }

  async getAllUsers() {
    return this.#user.findAll()
  }

  async getAllEmployees() {
    return this.#employee.findAll()
  }

  async getAllProducts() {
    return this.#product.findAll()
  }

  async getAllSessions() {
    return this.#session.findAll()
  }

  async getAllAcceptances() {
    return this.#acceptance.findAll()
  }

  async getAllIssuances() {
    return this.#issuance.findAll()
  }
  async getAllSectors() {
    return this.#sector.findAll()
  }

  syncronize() {
    this.#sequelize.sync({ alter: true });
  }

  async initializeSession(req) {
    if (!req.cookies.session) return;

    const session = await this.#session.findOne({
      where: {
        sessionId: req.cookies.session
      }
    });

    if (!session) return;

    const user = await this.#user.findOne({
      where: {
        id: session.UserId,
      }
    });


    if (!user) return;

    req.user = user;
  }

  async deleteSession(req) {
    if (!req.cookies.session) return;

    const session = await this.#session.findOne({
      where: {
        sessionId: req.cookies.session
      }
    });

    if (!session) return;

    await this.#session.destroy({
      where: {
        id: session.id
      }
    })
  }

  async login({ username, password }) {
    if (!username || !password) {
      // throw new Error('Укажите username и password');
      return { message: "Укажите username и password"};
    }

    const user = await this.#user.findOne({
      where: {
        username,
        password,
      }
    });


    if (!user) {
      // throw new Error('Неверный логин или пароль');
      return { message: "Неверный логин или пароль"};
    }

    const sessionKey = crypto.randomBytes(16).toString('hex');

    await this.#session.create({
      sessionId: sessionKey,
      UserId: user.id,
    });

    return { 
      id: sessionKey,
      message: "Сессия создана"
    }
  }

  async addUser(body, req) {

    if (!req.user) {
      // throw new Error('Вы не авторизованы!');
      return { message: "Вы не авторизованы!" };
    }

    if (!body.username || !body.password) {
      // throw new Error('Укажите username и password');
      return { message: "Укажите username и password" };
    }

    // TODO: проверять права доступа для создания нового юзера
    if (req.user.RoleId != 1) {
      // throw new Error('Вы не админ!!!'); не надо 
      return { message: "Вы не админ!!!" };
    }

    const user = await this.#user.findOne({
      where: {
        username: body.username,
      }
    });

    if (user) {
      // throw new Error('Такой пользователь уже существует'); не надо 
      return { message: "Пользователь " + body.username + " уже существует!" };
    }

    await this.#user.create({
      username: body.username, password: body.password
    });

    return { message: "Пользователь " + body.username + " успешно добавлен!" };
  }
}

module.exports = Database;