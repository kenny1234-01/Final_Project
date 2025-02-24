const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Admin } = require('../database/ModelUserAdmin');

// หน้าแอคมิน
router.get('/', (req, res) => {
    res.render('registerAdmin'); // หน้าลงทะเบียนสำหรับแอดมิน
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // เข้ารหัสรหัสผ่าน
    const newAdmin = new Admin({
        username: username,
        password: hashedPassword
    });

    try {
        await newAdmin.save();
        res.redirect('/Adminlogin'); // หลังจากสมัครสำเร็จ ให้ไปหน้าล็อกอิน
    } catch (error) {
        res.status(500).send('Error creating admin');
    }
});

module.exports = router;