const mongoose = require("mongoose");

const Schema=mongoose.Schema;

const QuestionSchema = new Schema({
    question: {
        type: String,
        required: [true, 'Question field is required']
    },
    answer: {
        type: String,
        required: [true, 'Correct answer must be provided']
    },
    options: {
        type: [String]
    },
    image: {
        type: String//path to image(optional)
    }
});

const QuizSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Quiz title required']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    questions: {
        type: [QuestionSchema],
        required: [true, 'Quiz cannot be blank']
    },
    noOfQuestions: {
        type: Number,
        required: [true],
        default: 10
    },
    time: {
        type: Number,
        default: 1//in minutes
    },
    category: {
        type: String,
        enum : ['General','MELA','Sports','SciTech','India'],
        default: 'General'
    },
    approved: {
        type: Boolean,
        default: false
    },
    takes: {
        type: Number,
        default: 0
    },
    average: {
        type: Number,
        default: 0.0
    }
});
const UserSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Name required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password required']
    },
    email: {
        type: String,
        required: [true, 'Email required'],
        unique: true
    },
    country: {
        type: String,
        required: [true, 'country required']
    },
    quizzes: [{
        type: Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    rating: {
        type: Number,
        default: 1000.0
    }
});

const Quiz = mongoose.model('Quiz',QuizSchema);
const User = mongoose.model('User',UserSchema);

var time = function(qns){
    return qns*0.75;
};
module.exports.Quiz = Quiz;
module.exports.User = User;
module.exports.time = time;