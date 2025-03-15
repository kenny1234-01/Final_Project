const axios = require('axios');
const cheerio = require('cheerio');
const { Parser } = require('json2csv');
const fs = require('fs');
const puppeteer = require('puppeteer');

function processComponentData(componentType, data) {
    const componentProcessors = {
        'CPU': () => ({
            'BrandCPU': data?.['Brand'] || 'none',
            'SeriesCPU': data?.['Series'] || 'none',
            'ModelCPU': data?.['Model'] || 'none',
            'CPU_Base_Clock': data?.['Socket'] || 'none',
            'Socket': data?.['Socket'] || 'none',
            'PriceCPU': data?.['price'] || 'none'
        }),
        'MB': () => ({
            'BrandMainboard': data?.['Brand'] || 'none',
            'ModelMainboard': data?.['Model'] || 'none',
            'Mainboard_CPU_Support': data?.['CPU Support'] || 'none',
            'MemoryMainboard': data?.['Memory Max.'] || 'none',
            'Mainboard_Memory_Support': data?.['Memory Support'] || 'none',
            'PriceMainboard': data?.['price'] || 'none'
        }),
        'VGA': () => ({
            'BrandVGA': data?.['Brand'] || 'none',
            'ChipsetVGA': data?.['GPU Chipset'] || 'none',
            'SeriesVGA': data?.['Series'] || 'none',
            'ModelVGA': data?.['Model'] || 'none',
            'VGA_Base_Clock': data?.['GPU Clock'] || 'none',
            'VGA_Boost_Clock': data?.['Boost Clock'] || 'none',
            'VGA_Memory_Clock': data?.['Memory Clock'] || 'none',
            'VGA_Memory_Size': data?.['Memory Size'] || 'none',
            'PriceVGA': data?.['price'] || 'none'
        }),
        'RAM': () => ({
            'RAM_Size': data?.['Memory Size'] || 'none',
            'RAM_Speed': data?.['Memory Speed'] || 'none',
            'PriceRAM': data?.['price'] || 'none'
        }),
        'SSD': () => ({
            'SSD_Size': data?.['Size'] || 'none',
            'SSD_Seq_Read': data?.['Seq. Read'] || 'none',
            'SSD_Seq_Write': data?.['Seq. Write'] || 'none',
            'PriceSSD': data?.['price'] || 'none'
        }),
        'HDD': () => ({
            'HDD_Size': data?.['Size'] || 'none',
            'PriceHDD': data?.['price'] || 'none'
        }),
        'PSU': () => ({
            'PSU_Power': data?.['Power'] || 'none',
            'PricePSU': data?.['price'] || 'none'
        }),
        'CASE': () => ({
            'CASE_Type': data?.['Type'] || 'none',
            'PriceCASE': data?.['price'] || 'none'
        }),
        'COOLING': () => ({
            'BrandCOOLING': data?.['Brand'] || 'none',
            'ModelCOOLING': data?.['Model'] || 'none',
            'Fan_Built_In_COOLING': data?.['Fan Built-in'] || 'none',
            'PriceCOOLING': data?.['price'] || 'none'
        }),
        'MONITOR': () => ({
            'BrandMONITOR': data?.['Brand'] || 'none',
            'ModelMONITOR': data?.['Model'] || 'none',
            'Display_Size_MONITOR': data?.['Display Size'] || 'none',
            'Max_Resolution_MONITOR': data?.['Max. Resolution'] || 'none',
            'Refresh_Rate_MONITOR': data?.['Refresh Rate'] || 'none',
            'PriceMONITOR': data?.['price'] || 'none'
        })
    };
    
    // Default processor for any component not explicitly handled
    const defaultProcessor = () => ({ [componentType]: 'none' });
    
    // Use the appropriate processor or default if not found
    const processor = componentProcessors[componentType] || defaultProcessor;
    return processor();
}

module.exports = { processComponentData };