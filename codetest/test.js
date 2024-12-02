const puppeteer = require('puppeteer');
const { Parser } = require('json2csv');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://notebookspec.com/pc/ranking');

  // กดปุ่ม "โหลดเพิ่มเติม" จนกว่าจะไม่มีให้กดอีก หรือข้อมูลครบ 2000 รายการ
  const hrefList = [];
  let loadMoreButton;

  do {
    loadMoreButton = await page.$('button.load-more');
    if (loadMoreButton) {
      await loadMoreButton.click();
      await new Promise(resolve => setTimeout(resolve, 3000)); // รอให้ข้อมูลโหลด

      // ตรวจสอบจำนวนรายการที่ดึงได้
      const currentLinks = await page.evaluate(() => {
        const rows = document.querySelectorAll('.table-row');
        const links = [];
        
        rows.forEach(row => {
          const titleCol = row.querySelector('.title-col');
          if (titleCol) {
            const nameElement = titleCol.querySelector('.name a');
            if (nameElement) {
              links.push(nameElement.href);
            }
          }
        });
        return links;
      });

      // เพิ่มลิงก์ใหม่ที่ดึงได้ลงใน hrefList โดยหลีกเลี่ยงค่าที่ซ้ำกัน
      currentLinks.forEach(link => {
        if (!hrefList.includes(link)) {
          hrefList.push(link);
        }
      });
    }
  } while (loadMoreButton && hrefList.length < 100);

  console.log(`จำนวนข้อมูลทั้งหมดที่ดึงมา: ${hrefList.length}`);

  // ฟังก์ชันเพื่อดึงลิงก์จากแต่ละหน้าใน hrefList
  async function scrapeLinks(url, browser) {
    const page = await browser.newPage();
    await page.goto(url);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // ดึงข้อมูลลิงก์จากหน้า
    const productLinks = await page.evaluate(() => {
      const products = {};
      const items = document.querySelectorAll('div.my-list-wrapper ul.my-list-item li.spec-item');
      items.forEach(item => {
        console.log(item)
        const link = item.querySelector('.name a');
        const key = item.querySelector('.type')?.innerText.trim().replace(":", "").replace(" ", "");
        if (link && key) {
          products[key] = link.href;
        }
      });
      return products;
    });

    await page.close();
    return productLinks;
  }

  const productData = [];
  
  // วนลูปดึงข้อมูลจากแต่ละลิงก์ใน hrefList
  for (let index = 0; index < hrefList.length; index++) {
    const productLinks = await scrapeLinks(hrefList[index], browser);
    productData.push(productLinks);
  }

  const requiredKeys = ['CPU', 'MB', 'VGA', 'RAM', 'SSD', 'SSD2', 'HDD', 'PSU', 'CASE', 'COOLING', 'MONITOR'];

  // ฟังก์ชันที่ใช้ตรวจสอบและเติมคีย์ที่ขาดหายไป
  function ensureKeys(data) {
    return data.map(item => {
      requiredKeys.forEach(key => {
        if (!item[key]) {
          item[key] = 'none';
        }
      });
      return item;
    });
  }

  // เพิ่มคีย์ที่ขาดหายไป
  const updatedItems = ensureKeys(productData);

  // พิมพ์ผลลัพธ์
  scrapeProductData(updatedItems);

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

    const results = await Promise.all(products.map(async (product) => {
      const productDetails = {};

      // ดึงข้อมูลจากแต่ละคีย์พร้อมกันโดยใช้ Promise.all
      const keys = Object.keys(product);
      const dataPromises = keys.map(async (key) => {
        const productUrl = product[key];
        return { key, data: await scrapeProductDetails(productUrl, key) };
      });
      const data = await Promise.all(dataPromises);

        data.forEach(({ key, data }) => {
            switch (key) {
                case 'CPU':
                    if (data) {
                        const requiredData = {};

                        requiredData['BrandCPU'] = data['Brand'] || 'none';
                        requiredData['SeriesCPU'] = data['Series'] || 'none';
                        requiredData['ModelCPU'] = data['Model'] || 'none';
                        requiredData['CPU_Base_Clock'] = data['Socket'] || 'none';
                        requiredData['Socket'] = data['Socket'] || 'none';
                        requiredData['PriceCPU'] = data['price'] || 'none';

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
                    if (data) {
                        const requiredData = {};

                        requiredData['BrandMainboard'] = data['Brand'] || 'none';
                        requiredData['ModelMainboard'] = data['Model'] || 'none';
                        requiredData['Mainboard_CPU_Support'] = data['CPU Support'] || 'none';
                        requiredData['MemoryMainboard'] = data['Memory Max.'] || 'none';
                        requiredData['Mainboard_Memory_Support'] = data['Memory Support'] || 'none';
                        requiredData['PriceMainboard'] = data['price'] || 'none';

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
                    if (data) {
                        const requiredData = {};

                        requiredData['BrandVGA'] = data['Brand'] || 'none';
                        requiredData['ChipsetVGA'] = data['GPU Chipset'] || 'none';
                        requiredData['SeriesVGA'] = data['Series'] || 'none';
                        requiredData['ModelVGA'] = data['Model'] || 'none';
                        requiredData['VGA_Base_Clock'] = data['GPU Clock'] || 'none';
                        requiredData['VGA_Boost_Clock'] = data['Boost Clock'] || 'none';
                        requiredData['VGA_Memory_Clock'] = data['Memory Clock'] || 'none';
                        requiredData['VGA_Memory_Size'] = data['Memory Size'] || 'none';
                        requiredData['PriceVGA'] = data['price'] || 'none';

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
                    if (data) {
                        const requiredData = {};

                        requiredData['RAM_Size'] = data['Memory Size'] || 'none';
                        requiredData['RAM_Speed'] = data['Memory Speed'] || 'none';
                        requiredData['PriceRAM'] = data['price'] || 'none';

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
                    if (data) {
                        const requiredData = {};

                        requiredData['SSD_Size'] = data['Size'] || 'none';
                        requiredData['SSD_Seq_Read'] = data['Seq. Read'] || 'none';
                        requiredData['SSD_Seq_Write'] = data['Seq. Write'] || 'none';
                        requiredData['PriceSSD'] = data['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['SSD_Size'] = 'none';
                        requiredData['SSD_Seq_Read'] = 'none';
                        requiredData['SSD_Seq_Write'] = 'none';
                        requiredData['PriceSSD'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;
                case 'HDD':
                    if (data) {
                        const requiredData = {};

                        requiredData['HDD_Size'] = data['Size'] || 'none';
                        requiredData['PriceHDD'] = data['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['HDD_Size'] = 'none';
                        requiredData['PriceHDD'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;
                case 'PSU':
                    if (data) {
                        const requiredData = {};

                        requiredData['PSU_Power'] = data['Power'] || 'none';
                        requiredData['PricePSU'] = data['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['PSU_Power'] = 'none';
                        requiredData['PricePSU'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;
                case 'CASE':
                    if (data) {
                        const requiredData = {};

                        requiredData['CASE_Type'] = data['Type'] || 'none';
                        requiredData['PriceCASE'] = data['price'] || 'none';

                        productDetails[key] = requiredData;
                    } else {
                        const requiredData = {};

                        requiredData['CASE_Type'] = 'none';
                        requiredData['PriceCASE'] = 'none';

                        productDetails[key] = requiredData;
                    }
                    break;
                case 'COOLING':
                    if (data) {
                        const requiredData = {};

                        requiredData['BrandCOOLING'] = data['Brand'] || 'none';
                        requiredData['ModelCOOLING'] = data['Model'] || 'none';
                        requiredData['Fan_Built_In_COOLING'] = data['Fan Built-in'] || 'none';
                        requiredData['PriceCOOLING'] = data['price'] || 'none';

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
                    if (data) {
                        const requiredData = {};

                        requiredData['BrandMONITOR'] = data['Brand'] || 'none';
                        requiredData['ModelMONITOR'] = data['Model'] || 'none';
                        requiredData['Display_Size_MONITOR'] = data['Display Size'] || 'none';
                        requiredData['Max_Resolution_MONITOR'] = data['Max. Resolution'] || 'none';
                        requiredData['Refresh_Rate_MONITOR'] = data['Refresh Rate'] || 'none';
                        requiredData['PriceMONITOR'] = data['price'] || 'none';

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
            }
        });

        return productDetails;
    }));
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

    const filePath = `products_com.csv`;  // ตั้งชื่อไฟล์โดยใช้ index

    // บันทึกไฟล์ CSV
    fs.writeFileSync(filePath, csv , 'utf8');
    console.log('CSV file has been saved.');

    // ตรวจสอบไฟล์ที่ถูกสร้าง
    if (fs.existsSync(filePath)) {
        console.log(`File ${filePath} has been created successfully.`);
    } else {
        console.error(`File ${filePath} was not created.`);
    }

  }
    

  await browser.close();
})();
