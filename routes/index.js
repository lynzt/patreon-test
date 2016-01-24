var express = require('express');
var router = express.Router();

var session = require('express-session')

/* GET home page. */
router.get('/', function(req, res, next) {
  var sess = req.session;

  res.render('index', { title: 'Express' });
});

module.exports = router;
