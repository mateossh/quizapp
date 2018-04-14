const path = require('path');
const fs = require('fs');
const csv = require('fast-csv');
const multer = require('multer');
const routes = require('express').Router();
const db = require('../../../db');
const auth = require('../../../auth');
const isAdmin = require('../../../middleware');

const images_storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/images/');
  },
});

const upload = multer({ dest: 'uploads/temp/' });
const upload_images = multer({ storage: images_storage });

/**
 * Return all questions.
 * @method
 */
routes.get('/', function (req, res) {
  db.questions.findAll().then(function(result) {
    res.status(200).json(result);
  }).catch(function (error) {
    res.status(400).json({ messsage: 'Error 400', error: error });
  });
});


/**
 * Return one question.
 * @method
 * @param {uuid} question - Question ID.
 */
routes.get('/:question', function (req, res) {
  db.questions.findOne({
    where: {
      id: req.params.question,
    },
  }).then(function (result) {
    res.status(200).json(result);
  }).catch(function (error) {
    res.status(400).json({ messsage: 'Error 400', error: error });
  });
});

/**
 * Return all questions from given categories
 * @method
 * @param {uuid} category - Category ID.
 */
routes.get('/category/:id', function(req, res) {
  db.questions.findAll({
    where: {
      category_id: req.params.id,
    },
    attributes: [
      'content',
      'created_at',
      'updated_at',
      'id',
      'has_image',
      'category_id',
      ['correct_answer', 'answer0'],
      ['wrong_answer1', 'answer1'],
      ['wrong_answer2', 'answer2'],
      ['wrong_answer3', 'answer3'],
    ],
  }).then(function(result) {
    res.status(200).json(result);
  }).catch(function (error) {
    res.status(400).json({ messsage: 'Error 400', error: error });
  });
});

/**
 * Add new question.
 * @method
 * @param {string} content - Question content.
 * @param {string} correct_answer - Correct answer content.
 * @param {string} wrong_answer1 - Wrong answer content.
 * @param {string} wrong_answer2 - Wrong answer content.
 * @param {string} wrong_answer3 - Wrong answer content.
 * @param {uuid} category_id - Category ID.
 */
routes.post('/', auth.passport.authenticate('jwt', { session: false }), isAdmin, function (req, res) {
  db.questions.create({
    content: req.body.content,
    correct_answer: req.body.correct_answer,
    wrong_answer1: req.body.wrong_answer1,
    wrong_answer2: req.body.wrong_answer2,
    wrong_answer3: req.body.wrong_answer3,
    category_id: req.body.category_id,
  }).then(function(result) {
    res.status(201).json({ message: 'Question added successfully', question: result });
  }).catch(function(error) {
    res.status(400).json({ messsage: 'Error 400', error: error });
  });
});

/**
 * Remove question.
 * @method
 * @param {uuid} id - Question ID.
 */
routes.delete('/', auth.passport.authenticate('jwt', { session: false }), isAdmin, function(req, res) {
  if (typeof(req.body.id) == 'undefined') {
    res.status(400).json({ error: 'Missing parameters!' });
  } else {
    db.questions.findOne({
      where: {
        id: req.body.id
      }
    }).then(function(result) {
      if (result == null) {
        // TODO: no JSON response
        res.status(204).json({ error: 'Question not found' });
      } else {
        db.questions.destroy({
          where: {
            id: req.body.id,
          }
        }).then(function() {
          res.status(200).json({ message: 'Question deleted successfully' });
        });
      }
    }).catch(function (error) {
      res.status(400).json({ messsage: 'Error 400', error: error });
    });
  }
});

/**
 * It handles uploading file with questions.
 * @method
 * @param {uuid} categoryid - Category ID.
 */
// routes.post('/upload', auth.passport.authenticate('jwt', { session: false }), upload.single('file'), isAdmin, function (req, res, next) {
routes.post('/upload', upload.single('file'), function (req, res) {
  var stream = fs.createReadStream(req.file.path);
  var csvStream = csv({
    delimiter: ',',
    quote: '"'
  })
    .on('data', function (data) {
      db.questions.create({
        content: data[0],
        correct_answer: data[1],
        wrong_answer1: data[2],
        wrong_answer2: data[3],
        wrong_answer3: data[4],
        category_id: req.body.category_id,
      });
    })
    .on('end', function () {
      // NOTE: unlink -> delete file
      fs.unlink(req.file.path);
    });
  stream.pipe(csvStream);
});

/**
 * It handles adding image to question.
 * @method
 * @param {uuid} questionid - Question ID.
 */
// routes.post('/upload/image', auth.passport.authenticate('jwt', { session: false }), upload_images.single('file'), isAdmin, function (req, res, next) {
routes.post('/upload/image', upload_images.single('file'), function (req, res) {
  if (!fs.existsSync(path.resolve(__dirname, '../../..', 'uploads', 'images', req.body.questionid))) {
    // change 'has_image' field in db
    if (typeof (req.body.questionid) == 'undefined') {
      res.status(400).json({ error: 'Missing parameters!' });
    } else {
      db.sequelize.sync().then(function () {
        db.questions.findOne({
          where: {
            id: req.body.questionid,
          },
        }).then(function (record) {
          record.update({
            has_image: 1,
          },
          {
            fields: ['has_image'],
          });
        });
      }).then(function () {
        res.status(201).json({ message: 'Image uploaded sucessfully' });

        // rename file
        fs.rename(path.resolve(__dirname, '../../..', 'uploads', 'images', req.file.filename),
                  path.resolve(__dirname, '../../..', 'uploads', 'images', req.body.questionid),
                  function(err) {
                    if (err) res.status(400).json({ message: 'Error 400', error: err });
                  });
      }).catch(function (error) {
        res.status(400).json({ messsage: 'Error 400', error: error });
      });
    }
  } else {
    res.status(400).json({ messsage: 'File associated with this question exist' });
  }
});

/**
 * It removes question image.
 * @method
 * @param {uuid} questionid - Question ID.
 */
routes.delete('/upload/image', auth.passport.authenticate('jwt', { session: false }), isAdmin, function(req, res) {
  if (typeof (req.body.questionid) == 'undefined') {
    res.status(400).json({ error: 'Missing parameters!' });
  } else {
    db.questions.findOne({
      where: {
        id: req.body.questionid,
      },
    }).then(function (record) {
      record.update({
        has_image: 0,
      },
      {
        fields: ['has_image'],
      }).then(function() {
        fs.unlink(path.resolve(__dirname, '../../..', 'uploads', 'images', req.body.questionid), function() {
          res.status(201).json({ message: 'Image deleted sucessfully' });
        });
      }).catch(function (error) {
        res.status(400).json({ messsage: 'Error 400', error: error });
      });
    });
  }
});

module.exports = routes;
