const express = require('express');
const { createAccount } = require('../controllers/AccountController');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.post('/', requireAuth, createAccount);

module.exports = router;
