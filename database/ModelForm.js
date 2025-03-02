const mongoose = require('mongoose');

const formWeb = new mongoose.Schema({
    UserID: String,
    email: {type: String, required: true, unique: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email format']},
    answer01: Number,
    answer02: Number,
    answer03: Number,
    answer04: Number,
    answer05: Number
});

const FromWeb = mongoose.model('assessments', formWeb);

module.exports = { FromWeb };