const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');

function normalizeProductData(data) {
    const REQUIRED_KEYS = ['CPU', 'MB', 'VGA', 'RAM', 'SSD', 'SSD2', 'HDD', 'PSU', 'CASE', 'COOLING', 'MONITOR'];
    return data.map(item => {
        REQUIRED_KEYS.forEach(key => {
            if (!item[key]) {
                item[key] = 'none';
            }
        });
        return item;
    });
}

module.exports = { normalizeProductData };