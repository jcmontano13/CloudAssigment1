// require express / import express package
const express = require('express');

// construct a router object 
const router = express.Router();

router.get('/', function (req, res) {
    res.redirect('/products');
});

router.get('/401', function (req, res) {
    res.status(401).render('shared/401');
});

router.get('/403', function (req, res) {
    res.status(403).render('shared/403');
});

// features objects that should be expose to other file
module.exports = router;