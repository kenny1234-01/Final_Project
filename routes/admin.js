const express = require('express');
const router = express.Router();
const { Spec } = require('../database/ModelSpec');
const { FromWeb } = require('../database/ModelForm');
const {requireLogin} = require('./loginAdmin');
const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');


router.get('/dashboard', requireLogin, async (req, res) => {
    const totalSpecs = await Spec.countDocuments();
    const gamingCount = await Spec.countDocuments({ Rank1: "Gaming" });
    const GeneralWorkCount = await Spec.countDocuments({ Rank1: "GeneralWork" });
    const ProgrammingCount = await Spec.countDocuments({ Rank1: "Programming" });
    const GraphicWorkCount = await Spec.countDocuments({ Rank1: "GraphicWork" });
    const totalFrom = await FromWeb.countDocuments();
    let answer01 = [];
    let answer02 = [];
    let answer03 = [];
    let answer04 = [];
    let answer05 = [];
    const answerStats01 = await FromWeb.find().select('answer01 -_id');
    const answerStats02 = await FromWeb.find().select('answer02 -_id');
    const answerStats03 = await FromWeb.find().select('answer03 -_id');
    const answerStats04 = await FromWeb.find().select('answer04 -_id');
    const answerStats05 = await FromWeb.find().select('answer05 -_id');
    for (let index = 0; index < answerStats01.length; index++) {
        answer01.push(answerStats01[index].answer01);
        answer02.push(answerStats02[index].answer02);
        answer03.push(answerStats03[index].answer03);
        answer04.push(answerStats04[index].answer04);
        answer05.push(answerStats05[index].answer05);
    }
    const count01 = answer01.reduce((acc, score) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
    }, {});
    const count02 = answer02.reduce((acc, score) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
    }, {});
    const count03 = answer03.reduce((acc, score) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
    }, {});
    const count04 = answer04.reduce((acc, score) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
    }, {});
    const count05 = answer05.reduce((acc, score) => {
        acc[score] = (acc[score] || 0) + 1;
        return acc;
    }, {});
    [1, 2, 3, 4, 5].forEach(num => {
        count01[num] = count01[num] || 0;
        count02[num] = count02[num] || 0;
        count03[num] = count03[num] || 0;
        count04[num] = count04[num] || 0;
        count05[num] = count05[num] || 0;
    });
    res.render('dashboardAdmin', {
        totalSpecs, 
        totalFrom, 
        gamingCount, 
        GeneralWorkCount, 
        ProgrammingCount, 
        GraphicWorkCount, 
        count01,
        count02,
        count03,
        count04,
        count05
    }); // หน้าหลักของแอดมิน
});

router.get('/dashboard/scraping', requireLogin, (req, res) => {
    res.render('scraping'); // หน้าเว็บ scraping
});

router.get('/dashboard/Edit', requireLogin, async (req, res) => {
    try {
        res.redirect('/admin/dashboard/Edit/page/1');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

router.get('/dashboard/Edit/page/:pageNumber', async (req, res) => {
    const page = parseInt(req.params.pageNumber) || 1; // หน้าที่ผู้ใช้ขอ
    const limit = 10; // จำนวนรายการต่อหน้า
    const skip = (page - 1) * limit;

    try {
        // ดึงข้อมูลจาก MongoDB collection 'speccom' พร้อม pagination
        const specs = await Spec.find().sort({ _id: -1 }).skip(skip).limit(limit);

        // ดึงข้อมูลทั้งหมดเพื่อคำนวณจำนวนหน้า
        const totalSpecs = await Spec.countDocuments();

        const totalPages = Math.ceil(totalSpecs / limit); // คำนวณจำนวนหน้าทั้งหมด

        res.render('editData', { 
            specs: specs,
            currentPage: page, 
            totalPages: totalPages, 
            query: ''
        });
    } catch (err) {
        res.status(500).send('Error retrieving specs');
    }
});

router.get('/dashboard/Edit/search', async (req, res) => {
    const query = req.query.query || ''; // รับคำค้น
    const page = parseInt(req.query.page) || 1; // หน้าที่ผู้ใช้ขอ
    const limit = 10; // จำนวนรายการต่อหน้า
    const skip = (page - 1) * limit;


    try {
        // ค้นหาจากชื่อคอมพิวเตอร์หรือซีพียู
        const specs = await Spec.find({
            $or: [
                { ModelCPU: { $regex: query, $options: 'i' } },
                { BrandCPU: { $regex: query, $options: 'i' } },
                { ModelVGA: { $regex: query, $options: 'i' } },
                { Rank1: { $regex: query, $options: 'i' }},
                { ModelCom: { $regex: query, $options: 'i' }},
            ]
        })
        .skip(skip)
        .limit(limit);

        const totalSpecs = await Spec.countDocuments({
            $or: [
                { ModelCPU: { $regex: query, $options: 'i' } },
                { BrandCPU: { $regex: query, $options: 'i' } },
                { ModelVGA: { $regex: query, $options: 'i' } },
                { Rank1: { $regex: query, $options: 'i' }},
                { ModelCom: { $regex: query, $options: 'i' }},
            ]
        });

        const totalPages = Math.ceil(totalSpecs / limit); // คำนวณจำนวนหน้าทั้งหมด
        const maxPagesToShow = 5; // จำนวนหน้าที่จะแสดง
        let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        // ถ้าหน้าสุดท้ายเกิน totalPages ให้ขยับ startPage
        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        res.render('editData', {
            specs: specs,
            currentPage: page,
            totalPages: totalPages,
            query: query,
            startPage: startPage,
            endPage: endPage,
        });
    } catch (err) {
        res.status(500).send('Error searching specs');
    }
});

// เพิ่มข้อมูล
router.get('/dashboard/Edit/AddData', requireLogin, async (req, res) => {
    try {
        const specs = {
            BrandCPU: '',
            SeriesCPU: '',
            ModelCPU: '',
            CPU_Base_Clock: 0,
            PriceCPU: 0,
            BrandMainboard: '',
            ModelMainboard: '',
            Mainboard_CPU_Support: '',
            MemoryMainboard: 0,
            Mainboard_Memory_Support: '',
            PriceMainboard: 0,
            BrandVGA: '',
            ChipsetVGA: '',
            SeriesVGA: '',
            ModelVGA: '',
            VGA_Base_Clock: 0,
            VGA_Boost_Clock: 0,
            VGA_Memory_Clock: 0,
            VGA_Memory_Size: 0,
            PriceVGA: 0,
            RAM_Size: 0,
            RAM_Speed: 0,
            PriceRAM: 0,
            CapacitySSD: 0,
            Read_SSD: 0,
            Write_SSD: 0,
            PriceSSD: 0,
            CapacitySSD2: 0,
            Read_SSD2: 0,
            Write_SSD2: 0,
            PriceSSD2: 0,
            CapacityHDD: 0,
            Speed_HDD: 0,
            PriceHDD: 0,
            PS: 0,
            PricePS: 0,
            BrandCASE: '',
            ModelCASE: '',
            WeightCASE: 0,
            I_O_Ports_CASE: '',
            PriceCASE: 0,
            BrandCOOLING: '',
            ModelCOOLING: '',
            Fan_Built_In_COOLING: '',
            PriceCOOLING: 0,
            BrandMONITOR: '',
            ModelMONITOR: '',
            Display_Size_MONITOR: 0,
            Max_Resolution_MONITOR: '',
            Refresh_Rate_MONITOR: 0,
            PriceMONITOR: 0,
            Rank1: '',
            Rank2: '',
            Rank3: ''
          };
        res.render('AddData', { spec: specs });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

router.post('/dashboard/Edit/AddData', requireLogin, async (req, res) => {
    try {
        const add_specs = req.body;
        const spec = new Spec(add_specs);
        await spec.save();

        res.redirect('/admin/dashboard/Edit');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

//แกไขข้อมูล
router.get('/dashboard/Edit/EditCom/:id', requireLogin, async (req, res) => {
    try {
        const specs = await Spec.findById(req.params.id);
        res.render('editCom', { spec: specs });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

router.put('/dashboard/Edit/EditCom/:id', requireLogin, async (req, res) => {
    try {
        const Up_specs = req.body;
        await Spec.findByIdAndUpdate(req.params.id,  Up_specs );
        res.json({ message: 'Update successful', redirectUrl: '/admin/dashboard/Edit' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

// ลบข้อมูล
router.delete('/dashboard/Edit/delete/:id', requireLogin, async (req, res) => {
    try {
        const specId = req.params.id;  // รับค่า _id จาก URL
        await Spec.findByIdAndDelete(specId);
        res.json({ redirectUrl: '/admin/dashboard/Edit' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});
  
// ใน route handler ส่ง `res` ไปยังฟังก์ชัน scrapeData
const { exportToCSV } = require('./WebScraping/exportToCSV');
const { extractComponentLinks } = require('./WebScraping/extractComponentLinks');
const { normalizeProductData } = require('./WebScraping/normalizeProductData');
const { scrapeProductData } = require('./WebScraping/scrapeProductData');
const { scrapeProductListings } = require('./WebScraping/scrapeProductListings');
const { ScrapingSpec } = require('../database/ModelCom');

router.post('/scrape', async (req, res) => {
    try {
        const { url, list } = req.body;
        const browser = await puppeteer.launch({ headless: false });
        
        // Step 1: Get all product listing URLs
        const hrefList = await scrapeProductListings(browser, url, list);
        console.log(`Total products fetched: ${hrefList.length}`);
        
        // Step 2: Extract component links from each product
        const productData = await extractComponentLinks(browser, hrefList);
        
        // Step 3: Ensure all required keys exist
        const normalizedData = normalizeProductData(productData);
        
        // Step 4: Fetch detailed specifications for each component
        const detailedData = await scrapeProductData(normalizedData);
        // Step 5: Export data to CSV and send to user
        await exportToCSV(detailedData, res);
        await ScrapingSpec.insertMany(detailedData);
        
        await browser.close();
    } catch (error) {
        console.error('Error in scrape endpoint:', error);
        res.status(500).send({ error: 'An error occurred during scraping' });
    }
});

router.get('/dashboard/viewForm', requireLogin, async (req, res) => {
    const viewForm = await FromWeb.find().sort({ _id: -1 });
    res.render('viewForm', {viewForm});
});


router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }
        res.redirect('/Adminlogin'); // เมื่อออกจากระบบแล้วให้กลับไปที่หน้า login
    });
});

module.exports = router;