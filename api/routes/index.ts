import express = require('express');
import users = require('./users');
import auctions = require('./auctions');

const router = express.Router();

router.use('/users', users);
router.use('/auctions', auctions);

export = router;
