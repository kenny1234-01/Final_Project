const express = require('express');
const router = express.Router();
const { Spec } = require('../database/ModelSpec');
const axios = require('axios');
const { Parser } = require('json2csv');

router.get('/', async (req, res) => {
    try {
        // รายการฟิลด์ที่ต้องการดึงจาก MongoDB
        const fields = [
            'BrandCPU', 'SeriesCPU', 'ModelCPU', 'CPU_Base_Clock', 'PriceCPU',
            'BrandMainboard', 'ModelMainboard', 'Mainboard_CPU_Support', 'MemoryMainboard', 'Mainboard_Memory_Support', 'PriceMainboard',
            'BrandVGA', 'ChipsetVGA', 'SeriesVGA', 'ModelVGA', 'VGA_Base_Clock', 'VGA_Boost_Clock', 'VGA_Memory_Clock', 'VGA_Memory_Size', 'PriceVGA',
            'RAM_Size', 'RAM_Speed', 'PriceRAM',
            'CapacitySSD', 'Read_SSD', 'Write_SSD', 'PriceSSD',
            'CapacitySSD2', 'Read_SSD2', 'Write_SSD2', 'PriceSSD2',
            'CapacityHDD', 'Speed_HDD', 'PriceHDD',
            'PS', 'PricePS',
            'BrandCASE', 'ModelCASE', 'WeightCASE', 'I_O_Ports_CASE', 'PriceCASE',
            'BrandCOOLING', 'ModelCOOLING', 'Fan_Built_In_COOLING', 'PriceCOOLING',
            'BrandMONITOR', 'ModelMONITOR', 'Display_Size_MONITOR', 'Max_Resolution_MONITOR', 'Refresh_Rate_MONITOR', 'PriceMONITOR'
        ];

        // ดึงข้อมูลทั้งหมดจาก MongoDB
        const dataPromises = fields.map(field => Spec.distinct(field));
        const dataResults = await Promise.all(dataPromises);

        // จัดเรียงข้อมูลให้ตรงกับฟิลด์
        const dataObject = Object.fromEntries(fields.map((field, index) => [field, dataResults[index]]));
        const Datarecommen = '';
        // Render หน้า recommen
        res.render('recommen', { ...dataObject, Datarecommen });
    } catch (error) {
        console.error('Error in /recom route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/', async (req, res) => {
    try {
        // รายการฟิลด์ที่ต้องการดึงจาก MongoDB
        const fields = [
            'BrandCPU', 'SeriesCPU', 'ModelCPU', 'CPU_Base_Clock', 'PriceCPU',
            'BrandMainboard', 'ModelMainboard', 'Mainboard_CPU_Support', 'MemoryMainboard', 'Mainboard_Memory_Support', 'PriceMainboard',
            'BrandVGA', 'ChipsetVGA', 'SeriesVGA', 'ModelVGA', 'VGA_Base_Clock', 'VGA_Boost_Clock', 'VGA_Memory_Clock', 'VGA_Memory_Size', 'PriceVGA',
            'RAM_Size', 'RAM_Speed', 'PriceRAM',
            'CapacitySSD', 'Read_SSD', 'Write_SSD', 'PriceSSD',
            'CapacitySSD2', 'Read_SSD2', 'Write_SSD2', 'PriceSSD2',
            'CapacityHDD', 'Speed_HDD', 'PriceHDD',
            'PS', 'PricePS',
            'BrandCASE', 'ModelCASE', 'WeightCASE', 'I_O_Ports_CASE', 'PriceCASE',
            'BrandCOOLING', 'ModelCOOLING', 'Fan_Built_In_COOLING', 'PriceCOOLING',
            'BrandMONITOR', 'ModelMONITOR', 'Display_Size_MONITOR', 'Max_Resolution_MONITOR', 'Refresh_Rate_MONITOR', 'PriceMONITOR'
        ];

        // ดึงข้อมูลทั้งหมดจาก MongoDB
        const dataPromises = fields.map(field => Spec.distinct(field));
        const dataResults = await Promise.all(dataPromises);

        // จัดเรียงข้อมูลให้ตรงกับฟิลด์
        const dataObject = Object.fromEntries(fields.map((field, index) => [field, dataResults[index]]));
        const specInput = req.body;
        const datarecom = await axios.post(process.env.URL_KNN, specInput);
        const Datarecommen = datarecom.data.prediction[0];
        let {Rank1,Rank2,Rank3,ProbabilityRank1,ProbabilityRank2,ProbabilityRank3} = Datarecommen;
        const CSV_Spec = {...req.body,Rank1,Rank2,Rank3,ProbabilityRank1,ProbabilityRank2,ProbabilityRank3};
        req.session.csvData = CSV_Spec;
        res.render('recommen', { ...dataObject, Datarecommen});
    } catch (error) {
        console.error('Error in /recom route:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/download-csv', (req, res) => {
    if (!req.session.csvData) {
        return res.status(400).send('No CSV data available');
    }

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse([req.session.csvData]);

    res.header('Content-Type', 'text/csv');
    res.attachment('specs.csv');
    res.send(csv);
});

module.exports = router;