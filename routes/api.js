const express = require('express');
const passport = require('passport');
const flash = require('express-flash');
const models = require('../models/models');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/quiz',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const Quiz=models.Quiz;
const User=models.User;
const time=models.time;

const router = express.Router();

const categories = ['General','MELA','Sports','SciTech','India'];

var maxRating = 1000.0;
var minRating = 1000.0;

function averageRating(){
    var rate = 0;
    var noOfUsers = User.length;
    User.find({}).then(function(users){
        users.forEach(function(user){
            rate+=user.rating;
        });
    });
    if(noOfUsers>0)
        return rate/noOfUsers;
    else
        return 0.0;
}
//if curr>userAverage
//x=(curr-userAverage)/(maxRating-userAverage)
//x*(maxScore-quizAverage)
function computeRating(quizAverage, userAverage, currRating, maxScore, userScore)
{
    var expectedScore = quizAverage;
    if(currRating>=userAverage)
    {
        var x;
        if(maxRating!=userAverage)
        {
            var proportion = (currRating-userAverage)/(maxRating-userAverage);
            x=proportion*(maxScore-quizAverage);
        }
        else
        x=0;
        expectedScore = quizAverage + x;
    }
    else
    {
        var x;
        if(minRating!=userAverage)
        {
            var proportion = (userAverage-currRating)/(userAverage-minRating);
            x=proportion*(quizAverage);
        }
        else
        x=0;
        expectedScore = quizAverage - x;
    }
    return currRating + (userScore-expectedScore)*20;
}

function loggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        //req.flash('error','You need to be logged in to visit the page!');
        res.redirect('/login');
    }
}

router.get('/',loggedIn,function(req,res,next){
    console.log(req.user);
    res.render('home',{
        user: req.user
    });
});

router.get('/login',function(req,res){
    res.render('login');
});

router.post('/login',passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/register',function(req,res,next){
    res.render('register');
});
router.post('/register',async function(req,res,next){
    try{
        const hashPwd = await bcrypt.hash(req.body.password,10);
        console.log('tried');
        console.log(req.body.username);
        User.create({
            username: req.body.username,
            password: hashPwd,
            email: req.body.email,
            country: req.body.country,
            quizzes: []
        }).then(function(user){
            console.log(user.username);
            res.redirect('/login');
        }).catch(next);
    }catch(err){
        console.log(err);
        res.redirect('/register')
    }
});
router.get('/logout',loggedIn,function(req,res,next){
    req.logOut();
    res.redirect('/login');
});
router.get('/create',loggedIn,function(req,res,next){
    res.render('create',{
        user: req.user,
        categories: categories
    });
});
//middleware
function attachQuiz(req,res,next){
    const quiz = new Quiz({
        title: req.body.title,
        noOfQuestions: parseInt(req.body.noOfQuestions,10),
        category: req.body.category,
        time: time(parseInt(req.body.noOfQuestions,10)),
        author: req.user,
        questions: []
    });
    req.quiz = quiz;
    next();
}
router.post('/create',loggedIn,function(req,res,next){
    //console.log(req.body.noOfQuestions);
    /*const quiz = new Quiz({
        title: req.body.title,
        noOfQuestions: parseInt(req.body.noOfQuestions,10),
        category: req.body.category,
        time: time(parseInt(req.body.noOfQuestions,10)),
        author: req.user,
        questions: []
    });*/
    Quiz.create({
        title: req.body.title,
        noOfQuestions: parseInt(req.body.noOfQuestions,10),
        category: req.body.category,
        time: time(parseInt(req.body.noOfQuestions,10)),
        author: req.user,
        questions: []
    }).then(function(quiz){
        var id = quiz._id.toString();
        res.redirect('/edit?id='+id+'&noOfQuestions='+quiz.noOfQuestions);
    }).catch(next);
    //var id = quiz._id.toString();
    //res.redirect('/edit?id='+id+'&noOfQuestions='+quiz.noOfQuestions);
});
router.get('/edit',loggedIn,function(req,res,next){
    var id=req.query.id;
    var noOfQuestions=parseInt(req.query.noOfQuestions);
    res.render('edit',{
        id: id,
        noOfQuestions: noOfQuestions
    });
});
router.post('/finish',loggedIn,function(req,res,next){
    const id= req.body.id;
    const questions = req.body.questions;
    console.log("quiz id="+id);
    //console.log('questions='+questions);
    /*Quiz.findOne({_id:mongoose.Types.ObjectId(id)},function(err,quiz){
        console.log("quiz="+quiz._id);
        res.send(quiz);
    });*/
    console.log("suestion0:");
    console.log(questions[0]);
    /*Quiz.findByIdAndUpdate(mongoose.Types.ObjectId(id),{
        $push: {
            questions: questions
        }
    }).then(function(err,quiz){
        
        console.log(err);
        console.log("quiz="+quiz._id);
        //res.send(quiz);
        res.send('<h1>Jeko</h1>');
    }).catch(next);*/
    Quiz.findById(mongoose.Types.ObjectId(id),function(err,quiz){
        questions.forEach(function(question){
            quiz.questions.push(question);
        });
        quiz.save(function(err,quiz){
            console.log(err);
            console.log(quiz);
            var message;
            if(err)
                message= 'Failure';
            else
                message= 'Success!';
            //res.send('<h1>Jekobhai</h1>');
            res.send('/create-finish?message='+message);
        });
    });
});

router.get('/create-finish',loggedIn,function(req,res,next){
    res.render('create-finish',{
        message: req.query.message
    });
});
/*router.get('/edit',loggedIn,function(req,res,next){
    console.log(quiz);
    res.send(quiz);
});*/

categories.forEach(function(cat){
    router.get('/'+cat.toLowerCase(),loggedIn,function(req,res,next){
        Quiz.find({category: cat, approved: true}).populate('author').then(function(quizzes){
            //console.log("id="+quizzes[0]._id.toString());
            res.render('quizzes',{
                category: cat,
                quizzes: quizzes,
                user: req.user._id.toString()
            });
        });
    });
});

router.get('/attempt/:id',loggedIn,function(req,res,next){
    Quiz.findById(/*mongoose.Types.ObjectId(req.params.id)*/req.params.id,function(err,quiz){
        if(quiz.takers.includes(user)||quiz.authot._id.toString()===req.user._id.toString())
            res.status(404).send("Sorry, you cannot take the quiz\n<a href='/home'>Home</a>");
        else{
            res.render('ask-attempt',{
                quiz: quiz
            });
        }
    });
});

router.post('/attempt',loggedIn,function(req,res,next){
    const id = req.body.id;
    //console.log("quix id="+id);
    res.send('/start?id='+id);
});

router.get('/start',loggedIn,function(req,res,next){
    const id = req.query.id;
    Quiz.findById(id,function(err,quiz){
        console.log("error="+err);
        res.render('start',{
            quiz: quiz
        });
    });
});
var attempt = [];
router.post('/submit',loggedIn,function(req,res,next){
    answers = req.body.answers;
    console.log("answers="+answers);
    id = req.body.id;
    Quiz.findById(id,function(err,quiz){
        if(err || quiz==null)
            return next();
        quiz.takers.push(req.user._id.toString());
        for(var i=0;i<quiz.noOfQuestions;i++){
            var correct = quiz.questions[i].answer;
            var answer = answers[i];
            attempt.push({
                question: quiz.questions[i].question,
                correct: quiz.questions[i].answer,
                answer: answers[i]
            });
        }
        res.send(attempt);
    });
});

router.get('/result/:id',loggedIn,function(req,res,next){
    var score = 0;
    attempt.forEach(function(qs){
        if(qs.answer===qs.correct)
        ++score;
    });
    Quiz.findById(mongoose.Types.ObjectId(req.params.id),function(err,quiz){
        var ave = quiz.average;
        var rating = req.user.rating;
        var aveUser = averageRating();

        var newRating = computeRating(ave,aveUser,rating,quiz.noOfQuestions,score);
        User.updateOne({_id:req.user._id},{rating: newRating},function(err,user){
            if(err||user==null)
                return next();
            if(newRating>maxRating)
                maxRating = newRating;
            if(newRating>minRating)
                minRating = newRating;
            var newQuizAverage = (quiz.average*quiz.takes+score)/(quiz.takes+1);
            var newTakes = quiz.takes+1;
            Quiz.updateOne({_id:quiz._id},{takes:newTakes,average:newQuizAverage},function(err,quiz){
                if(err||quiz==null)
                    return next();
                res.render('result',{
                    data: attempt,
                    score: score
                });
            }).then(function(){
                attempt = [];
            });
        });
    });
    //attempt = [];
});

router.get('/profile',loggedIn,function(req,res,next){
    var id;
    if(req.query.id)
        id=req.query.id;
    else
        id=req.user._id.toString();
    User.findById(id,function(err,user){
        if(err||user==null)
            return next();
        res.render('profile',{
            username: user.username,
            country: user.country,
            rating: user.rating
        });
    });
});

module.exports = router;