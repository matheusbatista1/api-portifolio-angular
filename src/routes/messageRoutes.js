const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, sync } = require('../controllers/messageController');

router.post('/send', sendMessage);
router.get('/list', getMessages);
router.get('/sync', sync);

module.exports = router;