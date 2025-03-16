const express = require('express');
const router = express.Router();
const { Spec } = require('../database/ModelSpec');
const { FromWeb } = require('../database/ModelForm');
const { ScrapingSpec } = require('../database/ModelCom');
const {requireLogin} = require('./loginAdmin');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const _ = require('lodash');

router.get('/dashboard', requireLogin, async (req, res) => {
    const totalSpecs = await Spec.countDocuments();
    const gamingCountR1 = await Spec.countDocuments({ Rank1: "Gaming" });
    const GeneralWorkCountR1 = await Spec.countDocuments({ Rank1: "GeneralWork" });
    const ProgrammingCountR1 = await Spec.countDocuments({ Rank1: "Programming" });
    const GraphicWorkCountR1 = await Spec.countDocuments({ Rank1: "GraphicWork" });

    const gamingCountR2 = await Spec.countDocuments({ Rank2: "Gaming" });
    const GeneralWorkCountR2 = await Spec.countDocuments({ Rank2: "GeneralWork" });
    const ProgrammingCountR2 = await Spec.countDocuments({ Rank2: "Programming" });
    const GraphicWorkCountR2 = await Spec.countDocuments({ Rank2: "GraphicWork" });

    const gamingCountR3 = await Spec.countDocuments({ Rank3: "Gaming" });
    const GeneralWorkCountR3 = await Spec.countDocuments({ Rank3: "GeneralWork" });
    const ProgrammingCountR3 = await Spec.countDocuments({ Rank3: "Programming" });
    const GraphicWorkCountR3 = await Spec.countDocuments({ Rank3: "GraphicWork" });

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
        gamingCountR1, 
        GeneralWorkCountR1, 
        ProgrammingCountR1, 
        GraphicWorkCountR1,
        gamingCountR2, 
        GeneralWorkCountR2, 
        ProgrammingCountR2, 
        GraphicWorkCountR2,
        gamingCountR3, 
        GeneralWorkCountR3, 
        ProgrammingCountR3, 
        GraphicWorkCountR3, 
        count01,
        count02,
        count03,
        count04,
        count05
    }); // หน้าหลักของแอดมิน
});

router.get('/dashboard/scraping', requireLogin, async (req, res) => {
    const SpecScraping = await ScrapingSpec.find().sort({ _id: -1 });
    res.render('scraping', {SpecScraping}); // หน้าเว็บ scraping
});

router.get('/dashboard/download-csv', async (req, res) => {
    try {
        // ดึงข้อมูลจากฐานข้อมูล
        const SpecScraping = await ScrapingSpec.find().sort({ _id: -1 });

        // ตรวจสอบว่า SpecScraping มีข้อมูลหรือไม่
        if (SpecScraping.length === 0) {
            return res.status(404).send('No data available to download');
        }

        // เตรียมข้อมูลที่จะแปลงเป็น CSV
        const processedData = SpecScraping.map(item => {
            const processedItem = {};

            // ประมวลผลทุกฟิลด์ในข้อมูล SpecScraping
            Object.keys(item.toObject()).forEach(key => {
                if (_.isObject(item[key])) {
                    // แปลงข้อมูลที่เป็น object ให้เป็นแค่ค่าเดียว
                    Object.keys(item[key]).forEach(subKey => {
                        const newKey = `${key}_${subKey}`;
                        processedItem[newKey] = _.get(item[key], subKey) || 'N/A';
                    });
                } else {
                    // แปลงข้อมูลทั่วไป
                    processedItem[key] = _.get(item, key) || 'N/A';
                }
            });

            return processedItem;
        });

        // แปลงข้อมูลที่ประมวลผลแล้วเป็น CSV
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(processedData);

        // ตั้งค่า headers สำหรับการดาวน์โหลด
        res.header('Content-Type', 'text/csv');
        res.attachment('SpecsScraping.csv');
        res.send(csv);

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating CSV file');
    }
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
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // พาธที่เก็บไฟล์ CSV
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // ชื่อไฟล์จะถูกตั้งใหม่ให้เป็น timestamp
    }
});

const upload = multer({ storage: storage });
router.get('/dashboard/Edit/AddData', requireLogin, async (req, res) => {
    try {
        res.render('AddData');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

router.post('/dashboard/Edit/AddData', requireLogin, upload.single('csvFile'), async (req, res) => {
    try {
        const filePath = req.file.path;
        console.log(filePath);
          // path ของไฟล์ที่อัปโหลด
        const results = [];

        // อ่านและแปลงข้อมูลจากไฟล์ CSV
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                results.push(row);  // เก็บข้อมูลใน array
            })
            .on('end', async () => {
                try {
                    // บันทึกข้อมูลทั้งหมดที่แปลงจาก CSV ลงฐานข้อมูล
                    await Spec.insertMany(results);
                    console.log('CSV file successfully processed and data added to DB');
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error('Error deleting file:', err);
                        } else {
                            console.log('File deleted successfully');
                        }
                    });
                    res.redirect('/admin/dashboard/Edit');
                } catch (err) {
                    console.error('Error saving data to database', err);
                    res.status(500).send('Error saving data');
                }
            });
    } catch (err) {
        console.error('Error processing file', err);
        res.status(500).send('Error processing file');
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
        res.status(500).json({ error: error.message });
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