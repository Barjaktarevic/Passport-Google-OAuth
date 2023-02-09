const express = require('express')
const router = express.Router()
const passport = require('passport')

// Auth Route
router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

// Auth Callback
router.get('/google/callback', passport.authenticate('google',
    { failureRedirect: '/' }), (req, res) => {
        res.redirect('/dashboard')
    })

// @desc    Logout user
// @router  /auth/logout
router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
})

module.exports = router