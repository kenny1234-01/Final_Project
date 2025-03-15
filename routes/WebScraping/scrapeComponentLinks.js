const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function scrapeComponentLinks(browser, url) {
    const page = await browser.newPage();
    const LOAD_MORE_DELAY = 3000;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await new Promise(resolve => setTimeout(resolve, LOAD_MORE_DELAY));

    const componentLinks = await page.evaluate(() => {
        const products = {};

        // ดึงรายการทุกอันที่อยู่ใน <ul class="my-list-item">
        const items = document.querySelectorAll('ul.my-list-item > li.spec-item');

        items.forEach(item => {
            const typeElement = item.querySelector('.type');
            const nameElement = item.querySelector('.name a');

            if (typeElement && nameElement) {
                const key = typeElement.innerText.trim().replace(":", "").replace(/\s/g, ""); // เช่น "CPU"
                const link = nameElement.href;

                if (key && link) {
                    products[key] = link; // บันทึกค่าเป็น { "CPU": "ลิงก์", "MB": "ลิงก์", ... }
                }
            }
        });

        return products;
    });

    await page.close();
    return componentLinks;
}


module.exports = { scrapeComponentLinks };