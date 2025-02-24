const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Admin = mongoose.model('com_admins', adminSchema);

module.exports = { Admin };