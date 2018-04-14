const routes = require('express').Router();
const db = require('../../../db');

/**
 * Return all categories
 * @method
 */
routes.get('/', function (req, res) {
  db.categories.findAndCountAll().then(function (result) {
    let counter = 0;
    let finalResults = [];
    result.rows.forEach(function (item, key) {
      db.questions.findAndCountAll({
        where: {
          category_id: item.id,
        },
      }).then(function (result1) {
        finalResults.push({
          id: item.id,
          name: item.name,
          created_at: item.created_at,
          question_count: result1.count,
        });
        counter++;
        if (counter >= result.count) {
          res.status(200).json(finalResults);
        }
      });
    });
  }).catch(function (error) {
    res.status(400).json({ messsage: 'Error 400', error: error });
  });
});

/**
 * Add new category
 * @method
 * @param {string} name - Category name.
 */
routes.post('/', function (req, res) {
  db.categories.create({
    name: req.body.name,
  }).then(function (result) {
    res.status(201).json({ message: 'Category added successfully', category: result });
  }).catch(function (error) {
    res.status(400).json({ messsage: 'Error 400', error: error });
  });
});


/**
 * Delete category
 * @method
 * @param {UUID} id - Category ID.
 */
routes.delete('/', function (req, res) {
  db.categories.destroy({
    where: {
      id: req.body.id,
    },
  }).then(function () {
    res.status(200).json({ message: 'Category deleted successfully' });
  }).catch(function (error) {
    res.status(400).json({ messsage: 'Error 400', error: error });
  });
});

module.exports = routes;
