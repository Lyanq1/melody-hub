import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Disc from '../models/disc.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// URL for scraping
const START_URL = 'https://store.hangdiathoidai.com/collections/available-now';

/**
 * Scrape products from Hang Dia Thoi Dai website
 * @param {boolean} saveToDb - Whether to save results directly to database
 * @returns {Array} - Array of scraped products
 */
export async function scrapeHangDiaThoiDai(saveToDb = true) {
  console.log('Starting scraping process...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new', // Use new headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Navigate to the initial page
  await page.goto(START_URL, { waitUntil: 'networkidle2' });
  
  // Determine total pages
  let maxPage = 17; // Default value
  try {
    const paginationLinks = await page.$$eval('.pagination .page a', links => {
      return links.map(link => {
        const num = parseInt(link.textContent.trim());
        return isNaN(num) ? 0 : num;
      }).filter(num => num > 0);
    });
    
    if (paginationLinks.length > 0) {
      maxPage = Math.max(...paginationLinks);
    }
  } catch (error) {
    console.log('Error getting pagination, using default value:', error.message);
  }
  
  console.log(`Total pages to scrape: ${maxPage}`);
  
  const products = [];
  
  // Scrape each page
  for (let page_num = 1; page_num <= maxPage; page_num++) {
    const url = `${START_URL}?page=${page_num}`;
    console.log(`Scraping page ${page_num}/${maxPage}: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Extract products from current page
    const pageProducts = await page.$$eval('.grid__item .product-container', items => {
      return items.map(item => {
        // Extract image
        const imgElement = item.querySelector('img');
        const image = imgElement ? imgElement.getAttribute('src') : '';
        
        // Extract name
        const nameElement = item.querySelector('h4.product-name a');
        const name = nameElement ? nameElement.textContent.trim() : '';
        
        // Extract price
        const priceElement = item.querySelector('.product-price');
        const price = priceElement ? priceElement.textContent.trim() : '';
        
        return {
          'image': image,
          'name': name,
          'price': price,
          'artist': '', // This would need to be extracted from product detail page
          'stock': 10, // Default value
          'releaseDate': new Date() // Default to current date
        };
      });
    });
    
    products.push(...pageProducts);
    
    // Wait a bit between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  await browser.close();
  console.log(`Scraping completed. Found ${products.length} products.`);
  
  // Save to CSV
  const csvPath = path.join(__dirname, 'products.csv');
  const csvContent = [
    'product-image,product-name,product-price', 
    ...products.map(p => `${p.image},${p.name.replace(/,/g, ' ')},${p.price}`)
  ].join('\n');
  
  fs.writeFileSync(csvPath, csvContent, 'utf8');
  console.log(`CSV file saved to ${csvPath}`);
  
  // Save to database if requested
  if (saveToDb) {
    try {
      const result = await saveProductsToDatabase(products);
      console.log(`Database updated: ${result.added} added, ${result.updated} updated`);
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  }
  
  return products;
}

/**
 * Save scraped products to MongoDB
 * @param {Array} products - Array of product objects
 * @returns {Object} - Results of the database operation
 */
async function saveProductsToDatabase(products) {
  let added = 0;
  let updated = 0;
  
  for (const product of products) {
    // Check if product already exists by name
    const existingProduct = await Disc.findOne({ name: product.name });
    
    if (existingProduct) {
      // Update existing product
      await Disc.updateOne(
        { _id: existingProduct._id },
        { 
          $set: { 
            image: product.image,
            price: product.price,
            // Only update other fields if they're not already set
            artist: existingProduct.artist || product.artist,
            stock: existingProduct.stock || product.stock
          } 
        }
      );
      updated++;
    } else {
      // Create new product
      await Disc.create(product);
      added++;
    }
  }
  
  return { added, updated };
}

// Allow direct execution of this file
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  scrapeHangDiaThoiDai().catch(console.error);
} 