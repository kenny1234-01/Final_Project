const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Admin } = require('../database/ModelUserAdmin');

router.get('/', (req, res) => {
    res.render('loginAsmin'); // แสดงหน้าล็อกอิน
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username: username });
    
    if (admin) {
        const validPassword = await bcrypt.compare(password, admin.password);
        if (validPassword) {
            req.session.adminId = admin._id; // เก็บ session เมื่อเข้าสู่ระบบสำเร็จ
            res.redirect('/admin/dashboard'); // ไปยังหน้าแอดมิน
        } else {
            res.status(400).send('Invalid username or password');
        }
    } else {
        res.status(400).send('Invalid username or password');
    }
});

function requireLogin(req, res, next) {
    if (!req.session.adminId) {
        return res.redirect('/Adminlogin'); // ถ้าไม่ได้ล็อกอินให้กลับไปหน้า login
    }
    next();
}

module.exports = {router, requireLogin};