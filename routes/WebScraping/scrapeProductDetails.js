const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function scrapeProductDetails(productUrl, key) {
    try {
        if (productUrl === 'none') {
            return null;
        }
        
        const response = await axios.get(productUrl);
        const $ = cheerio.load(response.data);
        
        const specifications = {};
        
        // Extract specifications
        $('.specificate-list').each((index, element) => {
            const title = $(element).find('.specificate-title').text().trim();
            const info = $(element).find('.specificate-info').text().trim();
            if (title && info) {
                specifications[title] = info;
            }
        });
        
        // Extract price
        specifications['price'] = $('.shop-item .price').text().trim();
        
        return specifications;
    } catch (error) {
        console.error(`Error scraping ${productUrl}:`, error.message);
        return null;
    }
}

module.exports = { scrapeProductDetails };