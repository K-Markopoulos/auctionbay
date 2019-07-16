import express = require('express');

import users = require('./users');

const router = express.Router();

router.use('/users', users);

export = router;
