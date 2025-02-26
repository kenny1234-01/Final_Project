const express = require('express');
const router = express.Router();
const { Spec } = require('../database/ModelSpec');

router.get('/', async (req, res) => {
    const specs = await Spec.find();
    const specsJIB = []; // กำหนดค่าเริ่มต้นเป็นว่างเปล่า
    res.render('index', { specs: specs, query: '' }); // เริ่มที่หน้าแรก
});

router.get('/search', async (req, res) => {
    const query = req.query.query || ''; // รับคำค้นจากฟอร์ม

    try {
        // ค้นหาใน MongoDB โดยเช็คจาก ModelCPU หรือ ModelMainboard หรือ ModelVGA
        const specs = await Spec.find({
            $or: [
                { ModelCPU: { $regex: query, $options: 'i' } },
                { BrandCPU: { $regex: query, $options: 'i' } },
                { ModelVGA: { $regex: query, $options: 'i' } },
                { Rank1: { $regex: query, $options: 'i' }},
                { ModelCom: { $regex: query, $options: 'i' }},
                { BrandCom: { $regex: query, $options: 'i' }},
            ]
        });

        // ส่งข้อมูลผลการค้นหากลับไปที่หน้า index
        res.render('index', { specs: specs, query: query });
    } catch (err) {
        res.status(500).send('Error retrieving specs');
    }
});

module.exports = router;