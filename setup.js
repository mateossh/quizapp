const fs = require('fs');
const path = require('path');
const execa = require('execa');
const chalk = require('chalk');
const cliSpinners = require('cli-spinners');
const ora = require('ora');
const inquirer = require('inquirer');

const questions = [
  {
    type: 'input',
    name: 'port',
    message: 'Enter port on which API will run (1024-65535)',
    default: 3000,
    validate: function(value) {
      return !isNaN(parseFloat(value)) && value >= 1024 && value <= 65535
        ? true
        : 'Enter value which is in range';
    },
    filter: Number,
  },
  {
    type: 'input',
    name: 'jwtSecret',
    message: 'Enter JWT secret',
    validate: function(value) {
      return value != '' ? true : 'This value can\'t be null. Enter value';
    },
  },
  {
    type: 'list',
    name: 'db.engine',
    message: 'Choose database engine',
    choices: ['mysql', 'sqlite', 'postgres', 'mssql'],
  },
  {
    type: 'input',
    name: 'db.host',
    message: 'Enter database host',
    default: 'localhost',
  },
  {
    type: 'input',
    name: 'db.user',
    message: 'Enter database username',
    default: null,
    validate: function(value) {
      return value != '' ? true : 'This value can\'t be null. Enter value';
    },
  },
  {
    type: 'password',
    name: 'db.password',
    message: 'Enter database password',
    mask: '*',
  },
  {
    type: 'input',
    name: 'db.database',
    message: 'Enter database database',
    default: null,
    validate: function(value) {
      return value != '' ? true : 'This value can\'t be null. Enter value';
    },
  },
];


console.log(chalk.bold('Hi, this is Quiz App installer\n'));

inquirer.prompt(questions).then(function(answers) {
  const data = JSON.stringify(answers, null, 2);

  fs.writeFile('config.json', data, function(err) {
    if (err) throw err;
    console.log(chalk.green('\nConfig file has been saved successfully'));

    const spinner = ora('Webpack is preparing the files...').start();

    execa.shell('./node_modules/webpack/bin/webpack.js' +
      ' --config '+
      ' webpack.prod.js '+
      ' --env.prod '
    ).then(function(res) {
      spinner.stop();
      console.log(chalk.green.bold('\nServe dist folder using webserver of your choice and you can start application ;]'));
    });
  });
});
