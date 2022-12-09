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
const { surname } = require('./models/Employee');


class Database {
  sequelize;
  user;
  employee;
  role;
  session;
  acceptance;
  issuance;
  sector;
  product;


  constructor({ database, username, password, host, dialect }) {
    this.sequelize = new Sequelize(
      database,
      username,
      password, {
      host,
      dialect,
    }
    );

    this.employee = this.sequelize.define('Employee', Employee, {
      tableName: 'Employees',
      timestamps: false,
    });

    this.user = this.sequelize.define('User', User, {
      tableName: 'Users',
      timestamps: false,
    });

    this.role = this.sequelize.define('Role', Role, {
      tableName: 'Roles',
      timestamps: false,
    });

    this.session = this.sequelize.define('Session', Session, {
      tableName: 'Sessions',
      timestamps: false,
    });

    this.acceptance = this.sequelize.define('Acceptance', Acceptance, {
      tableName: 'Acceptance',
      timestamps: false,
    });

    this.issuance = this.sequelize.define('Issuance', Issuance, {
      tableName: 'Issuance',
      timestamps: false,
    });

    this.sector = this.sequelize.define('Sector', Sector, {
      tableName: 'Sector',
      timestamps: false,
    });

    this.product = this.sequelize.define('Product', Product, {
      tableName: 'Product',
      timestamps: false,
    });


    this.employee.User = this.employee.belongsTo(this.user);
    this.user.Role = this.user.belongsTo(this.role, { as: 'role' });
    this.session.User = this.session.belongsTo(this.user);
    this.acceptance.Product = this.acceptance.belongsTo(this.product); 
    this.acceptance.Sector = this.acceptance.belongsTo(this.sector);
    this.acceptance.Employee = this.acceptance.belongsTo(this.employee);
    this.issuance.Product = this.issuance.belongsTo(this.product);
    this.issuance.Sector = this.issuance.belongsTo(this.sector);
    this.issuance.Employee = this.issuance.belongsTo(this.employee);
    this.product.Sector = this.product.belongsTo(this.sector);
    this.sector.Employee = this.sector.belongsTo(this.employee);
  }

  async getUsersById(usersId) {
    return this.user.findAll({
      where: {
        id: usersId,
      }
    })
  }

  async getAllUsers() {
    return this.user.findAll()
  }

  async getEmployeeBySurname(surnames) {
    return this.employee.findAll({
      where: {
        surname: surnames,
      }
    })
  }

  async getAllEmployees() {
    return this.employee.findAll()
  }

  async getAllProducts() {
    return this.product.findAll()
  }

  async getAllSessions() {
    return this.session.findAll()
  }

  async getAllAcceptances() {
    return this.acceptance.findAll()
  }

  async getAllIssuances() {
    return this.issuance.findAll()
  }

  async getSectorById(sectorId) {
    return this.sector.findAll({
      where: {
        id: sectorId,
      }
    })
  }

  async getAllSectors() {
    return this.sector.findAll()
  }


  async syncronize() {
    await this.sequelize.sync({ alter: true });
    const user = await this.user.findOne({
      where: {
        id: 1
      }
    })
    if (!user) {
      const role =
        (await this.role.findOne({ where: { id: 1 } })) ||
        (await this.role.create({ roleName: 'Admin', roleAccess: '*' }));
      const password = crypto.scryptSync('andy', '123', 32).toString('hex')
      const login = 'andy'
      await this.user.create({
        username: login,
        password: password,
        roleId: role.id,
      })
    }
  }

  async initializeSession(req) {
    if (!req.cookies.session) return;

    const session = await this.session.findOne({
      where: {
        sessionId: req.cookies.session
      }
    });

    if (!session) return;

    const user = await this.user.findOne({
      where: {
        id: session.UserId,
      },
      include: ['role']
    });


    if (!user) return;

    req.user = user;
  }

  async deleteSession(req) {
    if (!req.cookies.session) return;

    const session = await this.session.findOne({
      where: {
        sessionId: req.cookies.session
      }
    });

    if (!session) return;

    await this.session.destroy({
      where: {
        id: session.id
      }
    })
  }

  async login({ username, password }) {
    if (!username || !password) {
      // throw new Error('Укажите username и password');
      return { message: "Укажите username и password" };
    }

    const user = await this.user.findOne({
      where: {
        username,
        password: crypto.scryptSync(password, '123', 32).toString('hex'),
      }
    });


    if (!user) {
      // throw new Error('Неверный логин или пароль');
      return { message: "Неверный логин или пароль" };
    }

    const sessionKey = crypto.randomBytes(16).toString('hex');

    await this.session.create({
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

    const user = await this.user.findOne({
      where: {
        username: body.username,
      }
    });

    if (user) {
      return { message: "Пользователь " + body.username + " уже существует!" };
    }

    await this.user.create({
      username: body.username, password: crypto.scryptSync(body.password, '123', 32).toString('hex'), roleId: body.roleId,
    });

    return { message: "Пользователь " + body.username + " успешно добавлен!" };
  }

  async acceptProduct(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    await this.acceptance.create({
      acceptanceDate: body.acceptanceDate, quantityAccepted: body.quantityAccepted, price: body.price, ProductId: body.ProductId, SectorId: body.SectorId, EmployeeId: body.EmployeeId
    });

    return { message: "Изделие с ID=" + body.ProductId + " принято!" };
  }

  async issueProduct(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    await this.issuance.create({
      issueDate: body.issueDate, quantityIssued: body.quantityIssued, price: body.price, ProductId: body.ProductId, SectorId: body.SectorId, EmployeeId: body.EmployeeId
    });

    return { message: "Изделие " + body.price + " выдан!" };
  }

}

module.exports = Database;