var express = require('express');
var router = express.Router();

var patreon = require('patreon');

var demandPatreonAuth = require('../lib/middleware/passport').demandPatreonAuth;
var demandPatreonAuthCB = require('../lib/middleware/passport').demandPatreonAuthCB;

// Use the client id and secret you received when setting up your OAuth account
router.get( '/patreon', demandPatreonAuth);

router.get( '/patreon/callback', demandPatreonAuthCB);

module.exports = router;
