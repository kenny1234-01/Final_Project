const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');

const { scrapeProductDetails } = require('./scrapeProductDetails');
const { processComponentData } = require('./processComponentData');


async function scrapeProductData(products) {
    return Promise.all(products.map(async (product) => {
        const productDetails = {};
        const keys = Object.keys(product);
        
        const dataPromises = keys.map(async (key) => {
            const productUrl = product[key];
            const data = await scrapeProductDetails(productUrl, key);
            return { key, data };
        });
        
        const results = await Promise.all(dataPromises);
        
        results.forEach(({ key, data }) => {
            productDetails[key] = processComponentData(key, data);
        });
        
        return productDetails;
    }));
}

module.exports = { scrapeProductData };