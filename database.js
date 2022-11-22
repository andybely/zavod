const { Sequelize } = require('sequelize');

const Employee = require('./models/Employee');
const User = require('./models/User');
const Role = require('./models/Role');
const Session = require('./models/Session');
const crypto = require("crypto");

class Database {
  #sequelize;
  #user;
  #employee;
  #role;
  #session;

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

    this.#employee.User = this.#employee.belongsTo(this.#user);
    this.#employee.Role = this.#employee.belongsTo(this.#role);
    this.#session.User = this.#session.belongsTo(this.#user);
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
      throw new Error('Укажите username и password');
    }

    const user = await this.#user.findOne({
      where: {
        username,
        password,
      }
    });



    if (!user) {
      throw new Error('Неверный логин или пароль');
    }

    const sessionKey = crypto.randomBytes(16).toString('hex');

    await this.#session.create({
      sessionId: sessionKey,
      UserId: user.id,
    });

    return { id: sessionKey }
  }

  async addUser(body, req) {

    if (!req.user) {
      throw new Error('Вы не авторизованы!');
    }

    // TODO: проверять права доступа для создания нового юзера
    if (!body.username || !body.password) {
      throw new Error('Укажите username и password');
    }

    const user = await this.#user.findOne({
      where: {
        username: body.username,
      }
    });

    if (user) {
      throw new Error('Такой пользователь уже существует');
    }

    await this.#user.create({
      username: body.username, password: body.password
    });

    return { message: "Пользователь добавлен!" };
  }
}


module.exports = Database;