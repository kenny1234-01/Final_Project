const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function exportToCSV(productData, res) {
    const fields = [
        // CPU fields
        { label: 'BrandCPU', value: 'CPU.BrandCPU' },
        { label: 'SeriesCPU', value: 'CPU.SeriesCPU' },
        { label: 'ModelCPU', value: 'CPU.ModelCPU' },
        { label: 'CPU_Base_Clock', value: 'CPU.CPU_Base_Clock' },
        { label: 'Socket', value: 'CPU.Socket' },
        { label: 'PriceCPU', value: 'CPU.PriceCPU' },
        
        // Motherboard fields
        { label: 'BrandMainboard', value: 'MB.BrandMainboard' },
        { label: 'ModelMainboard', value: 'MB.ModelMainboard' },
        { label: 'Mainboard_CPU_Support', value: 'MB.Mainboard_CPU_Support' },
        { label: 'MemoryMainboard', value: 'MB.MemoryMainboard' },
        { label: 'Mainboard_Memory_Support', value: 'MB.Mainboard_Memory_Support' },
        { label: 'PriceMainboard', value: 'MB.PriceMainboard' },
        
        // Graphics card fields
        { label: 'BrandVGA', value: 'VGA.BrandVGA' },
        { label: 'ChipsetVGA', value: 'VGA.ChipsetVGA' },
        { label: 'SeriesVGA', value: 'VGA.SeriesVGA' },
        { label: 'ModelVGA', value: 'VGA.ModelVGA' },
        { label: 'VGA_Base_Clock', value: 'VGA.VGA_Base_Clock' },
        { label: 'VGA_Boost_Clock', value: 'VGA.VGA_Boost_Clock' },
        { label: 'VGA_Memory_Clock', value: 'VGA.VGA_Memory_Clock' },
        { label: 'VGA_Memory_Size', value: 'VGA.VGA_Memory_Size' },
        { label: 'PriceVGA', value: 'VGA.PriceVGA' },
        
        // RAM fields
        { label: 'RAM_Size', value: 'RAM.RAM_Size' },
        { label: 'RAM_Speed', value: 'RAM.RAM_Speed' },
        { label: 'PriceRAM', value: 'RAM.PriceRAM' },
        
        // SSD fields
        { label: 'CapacitySSD', value: 'SSD.SSD_Size' },
        { label: 'Read_SSD/Write_SSD', value: row => `${row.SSD.SSD_Seq_Read}/${row.SSD.SSD_Seq_Write}` },
        { label: 'PriceSSD', value: 'SSD.PriceSSD' },
        
        // Secondary SSD fields
        { label: 'CapacitySSD2', value: 'SSD2.SSD_Size' },
        { label: 'Read_SSD2/Write_SSD2', value: row => `${row.SSD2.SSD_Seq_Read || 'none'}/${row.SSD2.SSD_Seq_Write || 'none'}` },
        { label: 'PriceSSD2', value: 'SSD2.PriceSSD' },
        
        // HDD fields
        { label: 'CapacityHDD', value: 'HDD.HDD_Size' },
        { label: 'Speed_HDD', value: 'HDD.Speed_HDD' },
        { label: 'PriceHDD', value: 'HDD.PriceHDD' },
        
        // Power supply fields
        { label: 'PS', value: 'PSU.PSU_Power' },
        { label: 'PricePS', value: 'PSU.PricePSU' },
        
        // Case fields
        { label: 'BrandCASE', value: 'CASE.BrandCASE' },
        { label: 'ModelCASE', value: 'CASE.ModelCASE' },
        { label: 'WeightCASE', value: 'CASE.WeightCASE' },
        { label: 'I_O_Ports_CASE', value: 'CASE.I_O_Ports_CASE' },
        { label: 'PriceCASE', value: 'CASE.PriceCASE' },
        
        // Cooling fields
        { label: 'BrandCOOLING', value: 'COOLING.BrandCOOLING' },
        { label: 'ModelCOOLING', value: 'COOLING.ModelCOOLING' },
        { label: 'Fan_Built_In_COOLING', value: 'COOLING.Fan_Built_In_COOLING' },
        { label: 'PriceCOOLING', value: 'COOLING.PriceCOOLING' },
        
        // Monitor fields
        { label: 'BrandMONITOR', value: 'MONITOR.BrandMONITOR' },
        { label: 'ModelMONITOR', value: 'MONITOR.ModelMONITOR' },
        { label: 'Display_Size_MONITOR', value: 'MONITOR.Display_Size_MONITOR' },
        { label: 'Max_Resolution_MONITOR', value: 'MONITOR.Max_Resolution_MONITOR' },
        { label: 'Refresh_Rate_MONITOR', value: 'MONITOR.Refresh_Rate_MONITOR' },
        { label: 'PriceMONITOR', value: 'MONITOR.PriceMONITOR' },
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(productData);
    
    const filePath = `products_com.csv`;
    
    fs.writeFileSync(filePath, csv, 'utf8');
    console.log('CSV file has been saved.');
    
    if (fs.existsSync(filePath)) {
        console.log(`File ${filePath} has been created successfully.`);
    } else {
        console.error(`File ${filePath} was not created.`);
    }
    
    res.download(filePath, (err) => {
        if (err) {
            console.log('Error downloading file:', err);
        } else {
            console.log('File downloaded:', filePath);
            try {
                fs.unlinkSync(filePath);  // ลบไฟล์ที่อยู่ใน path
                console.log('File deleted after download');
            } catch (deleteErr) {
                console.log('Error deleting file:', deleteErr);
            }
            // Optionally clean up the file after download
            // fs.unlinkSync(filePath);
        }
    });
}

module.exports = { exportToCSV };