const express = require('express');
const router = express.Router();
const { FromWeb } = require('../database/ModelForm');

router.get('/', async (req, res) => {
    const form = {
        UserID: '',
        email: '',
        answer01: 0,
        answer02: 0,
        answer03: 0,
        answer04: 0,
        answer05: 0
    };
    res.render('FormWeb', {form});
});

router.post('/', async (req, res) => {
    try {
        // ค้นหา UserID ล่าสุด
        const lastId = await FromWeb.findOne().sort({ UserID: -1 });

        let newIdUser = "User1"; // ค่าพื้นฐาน

        if (lastId && lastId.UserID) {
            const lastIdNum = parseInt(lastId.UserID.replace("User", ""), 10);
            newIdUser = `User${String(lastIdNum + 1)}`;
        }

        // สร้าง User ใหม่
        const AddFormWeb = new FromWeb({ UserID: newIdUser, ...req.body });
        await AddFormWeb.save();
        
        res.redirect('/fromWeb');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;