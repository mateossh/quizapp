const bCrypt = require('bcrypt-nodejs');

module.exports = {
  generateHash: function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
  }
};
