const router = require('express').Router();

router.index = function (req, res, next) {
    res.render('index', {
        title: 'Openbadges 2.0 Bakery'
    });
}

module.exports = router;