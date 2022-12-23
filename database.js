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
const { surname, id } = require('./models/Employee');


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

  async getProductById(productsId) {
    return this.product.findAll({
      where: {
        id: productsId,
      }
    })
  }

  async getProductByNomination(nominations) {
    return this.product.findAll({
      where: {
        nomination: nominations,
      }
    })
  }

  async getProductBySector(SectorsId) {
    return this.product.findAll({
      where: {
        sectorId: SectorsId,
      }
    })
  }

  async getAllProducts() {
    return this.product.findAll()
  }

  async createProducts(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const nomination = await this.product.findOne({
      where: {
        nomination: body.nomination,
      }
    });

    if (nomination) {
      return { message: "Ноименование " + body.nomination + " уже существует!" };
    }

    await this.product.create({
      nomination: body.nomination, 
      quantity: body.quantity,
      defect: body.defect,
      description: body.description,
      SectorId: body.sectorId,
    });

    return { message: "Строительное изделие " + body.nomination + " успешно добавлено!" };
  }

  async updateProducts(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const update = await this.product.findOne({
      where: {
        id: body.updId
      }
    });

    if (update) {
      update.set({
        id: body.updId,
        nomination: body.updNomination, 
        quantity: body.updQuantity,
        defect: body.updDefect,
        description: body.updDescription,
        SectorId: body.updSectorId,
      });
      await update.save()
    }

    else {
      return { message: "Информации по строильному изделию с ID = " + body.updId + " не существует!" };
    }

    return { message: "Информация строительного изделия с ID = " + body.updId + " обновлена!" };
  }

  async deleteProducts(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const product = await this.product.findOne({
      where: {
        id: body.deleteId
      }
    });

    if (product) {
      await this.product.destroy({
        where: {
          id: body.deleteId
        }
      });
    }
    else {
      return { message: "Строительное изделие с ID = " + body.deleteId + " не существует!" };
    }

    return { message: "Строительное изделие  с ID = " + body.deleteId + " успешно удалено!" };
  }

  async getAllSessions() {
    return this.session.findAll()
  }

  async deleteSessions(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const session = await this.session.findOne({
      where: {
        id: body.deleteId
      }
    });

    if (session) {
      await this.session.destroy({
        where: {
          id: body.deleteId
        }
      });
    }
    else {
      return { message: "Сессии с ID = " + body.deleteId + " не существует!" };
    }

    return { message: "Сессия  с ID = " + body.deleteId + " успешно удалена!" };
  }

  async getSessionById(sessionId) {
    return this.session.findAll({
      where: {
        id: sessionId,
      }
    })
  }

  async getByAcceptEmployeeId(employeeId) {
    return this.acceptance.findAll({
      where: {
        employeeId: employeeId,
      }
    })
  }

  async getByDateAccept(dateAccept) {
    return this.acceptance.findAll({
      where: {
        acceptanceDate: dateAccept,
      }
    })
  }

  async getAllAcceptances() {
    return this.acceptance.findAll()
  }

  async updateAcceptances(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const update = await this.acceptance.findOne({
      where: {
        id: body.updId
      }
    });

    if (update) {
      update.set({
        id: body.updId,
        issueDate: body.updIssueDate, 
        quantityIssued: body.updQuantityIssued, 
        price: body.updPrice, 
        ProductId: body.updProductId, 
        SectorId: body.updSectorId, 
        EmployeeId: body.updEmployeeId

      });
      await update.save()
    }

    else {
      return { message: "Информации по принятому строительному изделию с ID = " + body.updId + " не существует!" };
    }

    return { message: "Информация принятого строительного изделия с ID = " + body.updId + " успешно обновлена!" };
  }

  async deleteAcceptances(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const acceptances = await this.acceptance.findOne({
      where: {
        id: body.deleteId
      }
    });

    if (acceptances) {
      await this.acceptance.destroy({
        where: {
          id: body.deleteId
        }
      });
    }
    else {
      return { message: "Принятого строительного изделия с ID = " + body.deleteId + " не существует!" };
    }

    return { message: "Принятое строительное изделие  с ID = " + body.deleteId + " успешно удалено!" };
  }

  async getByIssueEmployeeId(employeeId) {
    return this.issuance.findAll({
      where: {
        employeeId: employeeId,
      }
    })
  }

  async getByDateIssue(dateIssue) {
    return this.issuance.findAll({
      where: {
        issueDate: dateIssue,
      }
    })
  }

  async getAllIssuances() {
    return this.issuance.findAll()
  }

  async updateIssuances(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const update = await this.issuance.findOne({
      where: {
        id: body.updId
      }
    });

    if (update) {
      update.set({
        id: body.updId,
        acceptanceDate: body.updAcceptanceDate, 
        quantityAccepted: body.updQuantityAccepted, 
        price: body.updPrice, 
        ProductId: body.updProductId, 
        SectorId: body.updSectorId, 
        EmployeeId: body.updEmployeeId,
      });
      await update.save()
    }

    else {
      return { message: "Информации по выданному строительному изделию с ID = " + body.updId + " не существует!" };
    }

    return { message: "Информация выданного строительного изделия с ID = " + body.updId + " успешно обновлена!" };
  }

  async deleteIssuances(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const issuances = await this.issuance.findOne({
      where: {
        id: body.deleteId
      }
    });

    if (issuances) {
      await this.issuance.destroy({
        where: {
          id: body.deleteId
        }
      });
    }
    else {
      return { message: "Выданного строительного изделия с ID = " + body.deleteId + " не существует!" };
    }

    return { message: "Выданное строительное изделие  с ID = " + body.deleteId + " успешно удалено!" };
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

  async createSectors(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const sectorName = await this.sector.findOne({
      where: {
        sectorName: body.sectorName,
      }
    });

    if (sectorName) {
      return { message: "Сектор " + body.sectorName + " уже существует!" };
    }

    await this.sector.create({
      sectorName: body.sectorName, 
      EmployeeId: body.EmployeeId,
    });

    return { message: "Сектор " + body.nomination + " успешно добавлен!" };
  }

  async updateSectors(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const update = await this.sector.findOne({
      where: {
        id: body.updId
      }
    });

    if (update) {
      update.set({
        id: body.updId,
        sectorName: body.updSectorName, 
        EmployeeId: body.updEmployeeId,
      });
      await update.save()
    }

    else {
      return { message: "Информации по сектору с ID = " + body.updId + " не существует!" };
    }

    return { message: "Информация сектора с ID = " + body.updId + " успешно обновлена!" };
  }

  async deleteSectors(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const sector = await this.sector.findOne({
      where: {
        id: body.deleteId
      }
    });

    if (sector) {
      await this.sector.destroy({
        where: {
          id: body.deleteId
        }
      });
    }
    else {
      return { message: "Сессии с ID = " + body.deleteId + " не существует!" };
    }

    return { message: "Сессия  с ID = " + body.deleteId + " успешно удален!" };
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
      const id = '1'
      await this.user.create({
        id: id,
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
      return { message: "Укажите username и password" };
    }

    const user = await this.user.findOne({
      where: {
        username,
        password: crypto.scryptSync(password, '123', 32).toString('hex'),
      }
    });


    if (!user) {
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
      return { message: "Вы не авторизованы!" }; // throw new Error('Вы не авторизованы!');
    }

    if (!body.username || !body.password) {
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

  async updUser(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const update = await this.user.findOne({
      where: {
        id: body.updId
      }
    });

    if (update) {
      update.set({
        id: body.updId,
        username: body.updUsername, 
        password: crypto.scryptSync(body.updPassword, '123', 32).toString('hex'),
        roleId: body.UpdroleId,
      });
      await update.save()
    }

    else {
      return { message: "Информации по пользователю с ID = " + body.updId + " не существует! Для добавления заполните поля выше." };
    }

    return { message: "Информация пользователя с ID = " + body.updId + " успешно обновлена!" };
  }

  async deleteUser(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const user = await this.user.findOne({
      where: {
        id: body.deleteId
      }
    });

    if (user) {
      await this.user.destroy({
        where: {
          id: body.deleteId
        }
      });
    }
    else {
      return { message: "Пользователя с ID = " + body.deleteId + " не существует!" };
    }
    return { message: "Пользователь с ID = " + body.deleteId + " успешно удален!" };

  }

  async addEmployee(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const employee = await this.employee.findOne({
      where: {
        surname: body.surname,
        name: body.name,
        middleName: body.middleName,
      }
    });

    if (employee) {
      return { message: "Сотрудник " + body.surname + " уже существует!" };
    }

    await this.employee.create({
      surname: body.surname, name: body.name, middleName: body.middleName, dateOfBirth: body.dateOfBirth, address: body.address, phone: body.phoneNumber, jobTitle: body.jobTitle, UserId: body.userId
    });

    return { message: "Сотрудник " + body.surname + " успешно добавлен!" };
  }

  async updateEmployee(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const update = await this.employee.findOne({
      where: {
        id: body.updId
      }
    });

    if (update) {
      update.set({
        id: body.updId,
        surname: body.updSurname,
        name: body.updName,
        middleName: body.updMiddleName,
        dateOfBirth: body.updDateOfBirth,
        address: body.updAddress,
        phone: body.updPhoneNumber,
        jobTitle: body.updJobTitle,
        UserId: body.updUserId
      });
      await update.save()
    }

    else {
      return { message: "Информации по сотруднику с ID = " + body.updId + " не существует! Для добавления заполните поля выше." };
    }

    return { message: "Информация сотрудника с ID = " + body.updId + " обновлена!" };
  }

  async deleteEmployee(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    const employee = await this.employee.findOne({
      where: {
        id: body.deleteId
      }
    });

    if (employee) {
      await this.employee.destroy({
        where: {
          id: body.deleteId
        }
      });
    }
    else {
      return { message: "Сотрудника с ID = " + body.deleteId + " не существует!" };
    }

    return { message: "Сотрудник  с ID = " + body.deleteId + " успешно удален!" };
  }

  async acceptProduct(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }

    await this.acceptance.create({
      acceptanceDate: body.acceptanceDate, quantityAccepted: body.quantityAccepted, price: body.price, ProductId: body.ProductId, SectorId: body.SectorId, EmployeeId: body.EmployeeId
    });

    const accept = await this.product.findOne({
      where: {
        id: body.ProductId,
      }
    })

    accept.quantity = parseInt(accept.quantity) + parseInt(body.quantityAccepted),
      await accept.save()

    return { message: "Изделие с ID=" + body.ProductId + " принято!" };
  }

  async issueProduct(body, req) {

    if (!req.user) {
      return { message: "Вы не авторизованы!" };
    }
    await this.issuance.create({
      issueDate: body.issueDate, quantityIssued: body.quantityIssued, price: body.price, ProductId: body.ProductId, SectorId: body.SectorId, EmployeeId: body.EmployeeId
    });

    const issue = await this.product.findOne({
      where: {
        id: body.ProductId,
      }
    })

    issue.quantity = parseInt(issue.quantity) - parseInt(body.quantityIssued),
      await issue.save()

    return { message: "Изделие " + body.price + " выдано!" };
  }

}

module.exports = Database;