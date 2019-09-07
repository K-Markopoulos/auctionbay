import express = require('express');
import users = require('./users');
import auctions = require('./auctions');
import messages = require('./messages');

const router = express.Router();

router.use('/users', users);
router.use('/auctions', auctions);
router.use('/messages', messages);

export = router;
