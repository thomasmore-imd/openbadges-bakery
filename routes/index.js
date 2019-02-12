const express = require('express');
const router = express.Router();

const indexController = require('../controllers/index');
const bakeryController = require('../controllers/bakery');

/* GET home page. */
router.get('/', indexController.index);
router.get('/unbake', bakeryController.unbake);
router.post('/bake', bakeryController.bake);

module.exports = router;