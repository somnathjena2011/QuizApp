const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
//several methods of authentication=>
//1.passport-local=?using cookies and sessions(authenticated=true stored)
//2.passport-jwt
//3.third party(e.g. from google)
const models = require('./models/models');

const Quiz=models.Quiz;
const User=models.User;

module.exports = function(passport){
    const authenticateUser = function(username, password, done){
        User.findOne({username:username}).then(async function(user,err){
            //console.log(err);
            if(err || user==null){
                return done(null, false, {message:'No user with such username'});
            }
            try{
                if(await bcrypt.compare(password, user.password)){
                    //console.log('India');
                    return done(null,user);
                }else{
                    return done(null,false,{message:'Incorrect Password'});
                }
            }catch(err){
                return done(err);
            }
        });
    };
    passport.use(new localStrategy({
        usernameField: 'username'
    },authenticateUser));
/*
passport.serializeUser(function(user, done) {
    done(null, user.id);
});              │
                 │ 
                 │
                 └─────────────────┬──→ saved to session
                                   │    req.session.passport.user = {id: '..'}
                                   │
                                   ↓           
passport.deserializeUser(function(id, done) {
                   ┌───────────────┘
                   │
                   ↓ 
    User.findById(id, function(err, user) {
        done(err, user);
    });            └──────────────→ user object attaches to the request as req.user   
});
*/
    passport.serializeUser(function(user, done){
        //console.log("user.id="+user.id);
        done(null,user.id);
    });
    passport.deserializeUser(function(id, done){
        //console.log("id="+id);
        User.findById(mongoose.Types.ObjectId(id),function(err,user){
            //console.log("user deserialized="+user);
            return done(null,user);
        });
    });
};