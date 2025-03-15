const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');

const { scrapeComponentLinks } = require('./scrapeComponentLinks');

async function extractComponentLinks(browser, productUrls) {
    const productData = [];
    
    for (let index = 0; index < productUrls.length; index++) {
        console.log(`Processing product ${index + 1}/${productUrls.length}: ${productUrls[index]}`);
        const componentLinks = await scrapeComponentLinks(browser, productUrls[index]);
        productData.push(componentLinks);
    }
    
    return productData;
}

module.exports = { extractComponentLinks };