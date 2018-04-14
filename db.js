'use strict';

const Sequelize = require('sequelize');
const config = require('./config.json');

const sequelize = new Sequelize(config.db.database, config.db.user, config.db.password, {
  host: config.db.host,
  dialect: config.db.engine,
  define: {
    charset: 'utf8',
    collate: 'utf8_polish_ci',
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// |--------|
// | models |
// |--------|
db.users = require('./models/users.js')(sequelize, Sequelize);
db.quizzes = require('./models/quizzes.js')(sequelize, Sequelize);
db.questions = require('./models/questions.js')(sequelize, Sequelize);
db.users_answers = require('./models/users_answers.js')(sequelize, Sequelize);
db.users_quizzes = require('./models/users_quizzes.js')(sequelize, Sequelize);
db.quizzes_questions = require('./models/quizzes_questions.js')(sequelize, Sequelize);
db.categories = require('./models/categories.js')(sequelize, Sequelize);

// |-----------|
// | relations |
// |-----------|

db.quizzes.hasMany(db.users_answers);
db.users_answers.belongsTo(db.quizzes);

db.categories.hasMany(db.questions);
db.questions.belongsTo(db.categories);

db.quizzes.belongsToMany(db.questions, {
  through: {
    model: db.quizzes_questions,
  },
});

db.questions.belongsToMany(db.quizzes, {
  through: {
    model: db.quizzes_questions,
  },
});

db.users.belongsToMany(db.quizzes, {
  through: {
    model: db.users_quizzes,
  },
});

db.quizzes.belongsToMany(db.users, {
  through: {
    model: db.users_quizzes,
  },
});

db.users.belongsToMany(db.quizzes_questions, {
  through: {
    model: db.users_answers,
  },
});

db.quizzes_questions.belongsToMany(db.users, {
  through: {
    model: db.users_answers,
  },
});

module.exports = db;
