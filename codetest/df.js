const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');

async function scrapeProductDetails(productUrl, key) {
    try {
        if (key === 'none') {
            // ถ้า key เป็น 'none' ให้เติมข้อมูลเป็น 'none'
            return { [key]: 'none' };
        }

        // ถ้าไม่ใช่ 'none' หรือ 'CPU' ให้ scrape ข้อมูลตามปกติ
        const response = await axios.get(productUrl);
        const $ = cheerio.load(response.data);

        const specifications = {};
        $('.specificate-list').each((index, element) => {
            const title = $(element).find('.specificate-title').text().trim();
            const info = $(element).find('.specificate-info').text().trim();
            if (title && info) {
                specifications[title] = info;
            }
        });

        const price = $('.shop-item .price').text().trim();
        specifications['price'] = price;
        

        
        
        return specifications;
    } catch (error) {
        console.error(`Error scraping ${productUrl}:`, error.message);
        return null;
    }
}

async function scrapeProductData(products) {
    const results = [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productDetails = {};

        for (const key in product) {
            const productUrl = product[key];
            const scrapedData = await scrapeProductDetails(productUrl, key);
            switch (key) {
                case 'CPU':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['BrandCPU'] = scrapedData['Brand'] || 'none';
                        requiredData['SeriesCPU'] = scrapedData['Series'] || 'none';
                        requiredData['ModelCPU'] = scrapedData['Model'] || 'none';
                        requiredData['CPU_Base_Clock'] = scrapedData['Socket'] || 'none';
                        requiredData['Socket'] = scrapedData['Socket'] || 'none';
                        requiredData['PriceCPU'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['Brand'] = 'none';
                        requiredData['Series'] = 'none';
                        requiredData['Model'] = 'none';
                        requiredData['Socket'] = 'none';
                        requiredData['PriceCPU'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;

                case 'MB':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['BrandMainboard'] = scrapedData['Brand'] || 'none';
                        requiredData['ModelMainboard'] = scrapedData['Model'] || 'none';
                        requiredData['Mainboard_CPU_Support'] = scrapedData['CPU Support'] || 'none';
                        requiredData['MemoryMainboard'] = scrapedData['Memory Max.'] || 'none';
                        requiredData['Mainboard_Memory_Support'] = scrapedData['Memory Support'] || 'none';
                        requiredData['PriceMainboard'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['BrandMainboard'] = 'none';
                        requiredData['ModelMainboard'] = 'none';
                        requiredData['Mainboard_CPU_Support'] = 'none';
                        requiredData['MemoryMainboard'] = 'none';
                        requiredData['Mainboard_Memory_Support'] = 'none';
                        requiredData['PriceMainboard'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;

                case 'VGA':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['BrandVGA'] = scrapedData['Brand'] || 'none';
                        requiredData['ChipsetVGA'] = scrapedData['GPU Chipset'] || 'none';
                        requiredData['SeriesVGA'] = scrapedData['Series'] || 'none';
                        requiredData['ModelVGA'] = scrapedData['Model'] || 'none';
                        requiredData['VGA_Base_Clock'] = scrapedData['GPU Clock'] || 'none';
                        requiredData['VGA_Boost_Clock'] = scrapedData['Boost Clock'] || 'none';
                        requiredData['VGA_Memory_Clock'] = scrapedData['Memory Clock'] || 'none';
                        requiredData['VGA_Memory_Size'] = scrapedData['Memory Size'] || 'none';
                        requiredData['PriceVGA'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['BrandVGA'] = 'none';
                        requiredData['ChipsetVGA'] = 'none';
                        requiredData['SeriesVGA'] = 'none';
                        requiredData['ModelVGA'] = 'none';
                        requiredData['VGA_Base_Clock'] = 'none';
                        requiredData['VGA_Boost_Clock'] = 'none';
                        requiredData['VGA_Memory_Clock'] = 'none';
                        requiredData['VGA_Memory_Size'] = 'none';
                        requiredData['PriceVGA'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;
                case 'RAM':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['RAM_Size'] = scrapedData['Memory Size'] || 'none';
                        requiredData['RAM_Speed'] = scrapedData['Memory Speed'] || 'none';
                        requiredData['PriceRAM'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['RAM_Size'] = 'none';
                        requiredData['RAM_Speed'] = 'none';
                        requiredData['PriceRAM'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;

                case 'SSD':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['CapacitySSD'] = scrapedData['Capacity'] || 'none';
                        requiredData['Read_SSD/Write_SSD'] = scrapedData['Read / Write'] || 'none';
                        requiredData['PriceSSD'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['CapacitySSD'] = 'none';
                        requiredData['Read_SSD/Write_SSD'] = 'none';
                        requiredData['PriceSSD'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;

                case 'SSD2':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['CapacitySSD2'] = scrapedData['Capacity'] || 'none';
                        requiredData['Read_SSD/Write_SSD2'] = scrapedData['Read / Write'] || 'none';
                        requiredData['PriceSSD2'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['CapacitySSD2'] = 'none';
                        requiredData['Read_SSD2/Write_SSD2'] = 'none';
                        requiredData['PriceSSD2'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;

                case 'HDD':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['CapacityHDD'] = scrapedData['Capacity'] || 'none';
                        requiredData['Speed_HDD'] = scrapedData['Rotational Speed'] || 'none';
                        requiredData['PriceHDD'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['CapacityHDD'] = 'none';
                        requiredData['Speed_HDD'] = 'none';
                        requiredData['PriceHDD'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;

                case 'PSU':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['PS'] = scrapedData['Maximum Power'] || 'none';
                        requiredData['PricePS'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['PS'] = 'none';
                        requiredData['PricePS'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;
                
                case 'CASE':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['BrandCASE'] = scrapedData['Brand'] || 'none';
                        requiredData['ModelCASE'] = scrapedData['Model'] || 'none';
                        requiredData['WeightCASE'] = scrapedData['Weight'] || 'none';
                        requiredData['I_O_Ports_CASE'] = scrapedData['I/O Ports'] || 'none';
                        requiredData['PriceCASE'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['PS'] = 'none';
                        requiredData['PricePS'] = 'none';
                        requiredData['WeightCASE'] = 'none';
                        requiredData['I_O_Ports_CASE'] = 'none';
                        requiredData['PriceCASE'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;
                
                case 'COOLING':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['BrandCOOLING'] = scrapedData['Brand'] || 'none';
                        requiredData['ModelCOOLING'] = scrapedData['Model'] || 'none';
                        requiredData['Fan_Built_In_COOLING'] = scrapedData['Fan Built-In'] || 'none';
                        requiredData['PriceCOOLING'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['BrandCOOLING'] = 'none';
                        requiredData['ModelCOOLING'] = 'none';
                        requiredData['Fan_Built_In_COOLING'] = 'none';
                        requiredData['PriceCOOLING'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;

                case 'MONITOR':
                    if (scrapedData) {
                        const requiredData = {};

                        requiredData['BrandMONITOR'] = scrapedData['Brand'] || 'none';
                        requiredData['ModelMONITOR'] = scrapedData['Model'] || 'none';
                        requiredData['Display_Size_MONITOR'] = scrapedData['Display Size'] || 'none';
                        requiredData['Max_Resolution_MONITOR'] = scrapedData['Max Resolution'] || 'none';
                        requiredData['Refresh_Rate_MONITOR'] = scrapedData['Refresh Rate'] || 'none';
                        requiredData['PriceMONITOR'] = scrapedData['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['BrandMONITOR'] = 'none';
                        requiredData['ModelMONITOR'] = 'none';
                        requiredData['Display_Size_MONITOR'] = 'none';
                        requiredData['Max_Resolution_MONITOR'] = 'none';
                        requiredData['Refresh_Rate_MONITOR'] = 'none';
                        requiredData['PriceMONITOR'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;
            
                default:
                    break;
            }
        }
        results.push(productDetails);
    }

    exportToCSV(results)
}

async function exportToCSV(productData) {
    const fields = [
        // ระบุ key หลักและคีย่อยตามลำดับที่ต้องการ
        { label: 'BrandCPU', value: 'CPU.BrandCPU' },
        { label: 'SeriesCPU', value: 'CPU.SeriesCPU' },
        { label: 'ModelCPU', value: 'CPU.ModelCPU' },
        { label: 'CPU_Base_Clock', value: 'CPU.CPU_Base_Clock' },
        { label: 'Socket', value: 'CPU.Socket' },
        { label: 'PriceCPU', value: 'CPU.PriceCPU' },

        { label: 'BrandMainboard', value: 'MB.BrandMainboard' },
        { label: 'ModelMainboard', value: 'MB.ModelMainboard' },
        { label: 'Mainboard_CPU_Support', value: 'MB.Mainboard_CPU_Support' },
        { label: 'MemoryMainboard', value: 'MB.MemoryMainboard' },
        { label: 'Mainboard_Memory_Support', value: 'MB.Mainboard_Memory_Support' },
        { label: 'PriceMainboard', value: 'MB.PriceMainboard' },

        { label: 'BrandVGA', value: 'VGA.BrandVGA' },
        { label: 'ChipsetVGA', value: 'VGA.ChipsetVGA' },
        { label: 'SeriesVGA', value: 'VGA.SeriesVGA' },
        { label: 'ModelVGA', value: 'VGA.ModelVGA' },
        { label: 'VGA_Base_Clock', value: 'VGA.VGA_Base_Clock' },
        { label: 'VGA_Boost_Clock', value: 'VGA.VGA_Boost_Clock' },
        { label: 'VGA_Memory_Clock', value: 'VGA.VGA_Memory_Clock' },
        { label: 'VGA_Memory_Size', value: 'VGA.VGA_Memory_Size' },
        { label: 'PriceVGA', value: 'VGA.PriceVGA' },

        { label: 'RAM_Size', value: 'RAM.RAM_Size' },
        { label: 'RAM_Speed', value: 'RAM.RAM_Speed' },
        { label: 'PriceRAM', value: 'RAM.PriceRAM' },

        { label: 'CapacitySSD', value: 'SSD.CapacitySSD' },
        { label: 'Read_SSD/Write_SSD', value: 'SSD.Read_SSD/Write_SSD' },
        { label: 'PriceSSD', value: 'SSD.PriceSSD' },

        { label: 'CapacitySSD2', value: 'SSD2.CapacitySSD2' },
        { label: 'Read_SSD2/Write_SSD2', value: 'SSD2.Read_SSD2/Write_SSD2' },
        { label: 'PriceSSD2', value: 'SSD2.PriceSSD2' },

        { label: 'CapacityHDD', value: 'HDD.CapacityHDD' },
        { label: 'Speed_HDD', value: 'HDD.Speed_HDD' },
        { label: 'PriceHDD', value: 'HDD.PriceHDD' },

        { label: 'PS', value: 'PSU.PS' },
        { label: 'PricePS', value: 'PSU.PricePS' },

        { label: 'BrandCASE', value: 'CASE.BrandCASE' },
        { label: 'ModelCASE', value: 'CASE.ModelCASE' },
        { label: 'WeightCASE', value: 'CASE.WeightCASE' },
        { label: 'I_O_Ports_CASE', value: 'CASE.I_O_Ports_CASE' },
        { label: 'PriceCASE', value: 'CASE.PriceCASE' },

        { label: 'BrandCOOLING', value: 'COOLING.BrandCOOLING' },
        { label: 'ModelCOOLING', value: 'COOLING.ModelCOOLING' },
        { label: 'Fan_Built_In_COOLING', value: 'COOLING.Fan_Built_In_COOLING' },
        { label: 'PriceCOOLING', value: 'COOLING.PriceCOOLING' },

        { label: 'BrandMONITOR', value: 'MONITOR.BrandMONITOR' },
        { label: 'ModelMONITOR', value: 'MONITOR.ModelMONITOR' },
        { label: 'Display_Size_MONITOR', value: 'MONITOR.Display_Size_MONITOR' },
        { label: 'Max_Resolution_MONITOR', value: 'MONITOR.Max_Resolution_MONITOR' },
        { label: 'Refresh_Rate_MONITOR', value: 'MONITOR.Refresh_Rate_MONITOR' },
        { label: 'PriceMONITOR', value: 'MONITOR.PriceMONITOR' },
    ];

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(productData);

    // บันทึกเป็นไฟล์ CSV
    fs.writeFileSync('output.csv', csv);
    console.log('CSV file has been saved.');
}

// เรียกใช้งานฟังก์ชัน
// ตัวอย่างข้อมูล
const products = [
    { 
        CPU: 'https://notebookspec.com/pc-cpu/275-intel-core-i9-7980xe.html',
        MB: 'https://notebookspec.com/pc-mb/989-asus-rog-rampage-vi-extreme.html',
        VGA: 'https://notebookspec.com/pc-vga/989-asus-rog-strix-rtx-2080ti-advanced-edition.html',
        RAM: 'https://notebookspec.com/pc-ram/727-corsair-vengeance-pro-rgb-ddr4-32gb-8gbx4-3600-black.html',
        SSD: 'https://notebookspec.com/pc-ssd/319-samsung-960-pro-m2-2tb.html',
        SSD2: 'https://notebookspec.com/pc-ssd/371-samsung-860-evo-2tb.html',
        HDD: 'https://notebookspec.com/pc-hdd/177-seagate-ironwolf-pro-12tb-st12000ne0007.html',
        PSU: 'https://notebookspec.com/pc-psu/432-corsair-ax1600i-titanium.html',
        CASE: 'https://notebookspec.com/pc-case/630-corsair-obsidian-1000d-rgb.html',
        COOLING: 'https://notebookspec.com/pc-liquid-cooling/171-thermaltake-pacific-series.html'
    },
    {
        CPU: 'none',
        MB: 'https://notebookspec.com/pc-mb/1549-gigabyte-b450m-ds3h-v2.html',
        VGA: 'https://notebookspec.com/pc-vga/2055-msi-geforce-rtx-4070-super-12g-ventus-2x-white-oc.html',
        RAM: 'https://notebookspec.com/pc-ram/1516-blackberry-maximus-ddr4-32gb-16gbx2-3200-gray.html',
        SSD: 'https://notebookspec.com/pc-ssd/888-hiksemi-future-512gb-with-heatsink.html',
        PSU: 'https://notebookspec.com/pc-psu/760-coolermaster-mwe-bronze-750-v3.html',
        CASE: 'https://notebookspec.com/pc-case/1324-nzxt-h5-flow-white.html',
        COOLING: 'https://notebookspec.com/pc-liquid-cooling/410-thermaltake-th240-v2-argb-sync.html',
        MONITOR: 'https://notebookspec.com/pc-monitor/1637-benq-mobiuz-ex270qm.html'
    }
];

scrapeProductData(products).then(results => {
    console.log(results);
});
