//sudo mongod --dbpath /var/lib/mongo --logpath /var/log/mongodb/mongod.log --fork
if(process.env.NODE_ENV!=='production'){
    require('dotenv').config();
}

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/api');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('./passport-config');
initializePassport(passport);

const app = express();
//bcrypt is used to hash our passwords
//so that our app is secure
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost/quiz',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

app.set('view engine','ejs');

app.use('/public',express.static('public'));

app.use(bodyParser.urlencoded({extended:true}));

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/',routes);

app.use(function(err,req,res,next){
    res.status(422).send({
        error: err.message
    });
});

app.listen(process.env.port || 5000,function(){
    console.log('now listening for requests..')
});