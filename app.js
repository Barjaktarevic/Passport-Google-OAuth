const express = require('express')
const connectDB = require('./config/db')
const morgan = require('morgan')
const path = require('path')
const passport = require('passport')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
const methodOverride = require('method-override')

const app = express()

// Body parser middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(methodOverride('_method'))

// Load config
require('dotenv').config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// EJS
app.set('views', 'views')
app.set('view engine', 'ejs')

// Sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        mongooseConnection: mongoose.connection
    }),

}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// Set global variable
app.use(function (req, res, next) {
    res.locals.user = req.user || null  //locals is how we set up global variables
    next()
})


app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const PORT = process.env.PORT || PORT

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`))