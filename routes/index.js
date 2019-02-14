const express = require('express');
const router = express.Router();

var multer = require('multer');
var upload = multer({
    dest: 'uploads/'
})

const indexController = require('../controllers/index');
const bakeryController = require('../controllers/bakery');

// public pages
router.get('/', indexController.index);

// api routes
router.post('/api/unbake', upload.single('badge'), bakeryController.unbake);
router.post('/api/bake', bakeryController.bake);

module.exports = router;