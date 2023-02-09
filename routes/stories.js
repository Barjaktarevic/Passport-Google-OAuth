const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Story = require('../models/Story')

// Show add page
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})

router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id //this is I reckon how you properly accept the user on post requests on the backend
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error)
        res.render('error/500')
    }
})

// Show all stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' }).populate('user').sort({ createdAt: 'desc' })
        res.render('stories/index', { stories })
    } catch (error) {
        console.log(error)
        res.render('error/500')
    }
})

// Show individual story
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).populate('user')

        if (!story) {
            return res.render('error/404')
        }
        res.render('stories/show', { story })
    } catch (error) {
        console.log(err)
        return res.render('error/404')
    }
})

// Show edit story page
router.get('/edit/:id', ensureAuth, async (req, res) => {
    const story = await Story.findOne({ _id: req.params.id })
    if (!story) {
        return res.render('error/404')
    }

    if (story.user != req.user.id) {
        console.log('Nice try buddy!')
        res.redirect('/stories')
    } else {
        res.render('stories/edit', { story })
    }
})

// Edit story
// Inače, ovako se pišu routes descriptions:
//  @desc   Update story
//  @route  PUT /stories/:id
router.put('/edit/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id)

        if (!story) {
            return res.render('error/404')
        }

        if (story.user != req.user.id) {
            console.log('Nice try buddy!')
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true }) //noteice the new:true
            res.redirect('/dashboard')
        }
    } catch (err) {
        console.log(err)
    }
})

// Delete story
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.findOneAndDelete({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (err) {
        console.log(err)
        return res.render('error/500')
    }
})

// Show user stories
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ user: req.params.userId, status: 'public' }).populate('user')
        res.render('stories/index', { stories })
    } catch (error) {
        console.log(error)
        res.render('error/500')
    }
})

module.exports = router