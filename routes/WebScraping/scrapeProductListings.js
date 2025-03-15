const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function scrapeProductListings(browser, url, targetCount) {
    const page = await browser.newPage();
    await page.goto(url);
    const LOAD_MORE_DELAY = 3000;
    
    const hrefList = [];
    let loadMoreButton;
    
    do {
        loadMoreButton = await page.$('button.load-more');
        if (loadMoreButton) {
            await loadMoreButton.click();
            // Use setTimeout with a Promise instead of waitForTimeout
            await new Promise(resolve => setTimeout(resolve, LOAD_MORE_DELAY));
            
            const currentLinks = await page.evaluate(() => {
                const rows = document.querySelectorAll('.table-row');
                return Array.from(rows)
                    .map(row => {
                        const nameElement = row.querySelector('.title-col .name a');
                        return nameElement ? nameElement.href : null;
                    })
                    .filter(link => link !== null);
            });
            
            // Add new unique links
            currentLinks.forEach(link => {
                if (!hrefList.includes(link)) {
                    hrefList.push(link);
                }
            });
        }
    } while (loadMoreButton && hrefList.length < targetCount);
    
    await page.close();
    return hrefList;
}

module.exports = { scrapeProductListings };