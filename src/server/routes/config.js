const express = require('express');
const router = express.Router();

const GetConfig = require('../configManager.js');

router.get('/getconfig', (req, res) => {
    const config = GetConfig(false);
    res.json(config);
});

module.exports = router;