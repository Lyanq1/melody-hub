import express from 'express';
import * as scrapeController from '../controllers/scrape.controller.js';

const router = express.Router();

// Get scraper configuration
router.get('/config', scrapeController.getConfig);

// Update scraper configuration
router.put('/config', scrapeController.updateConfig);

// Trigger manual scraping
router.post('/run', scrapeController.triggerScraping);

// Get current scraping status
router.get('/status', scrapeController.getScrapingStatus);

// Save scraped data to database
router.post('/save-to-db', scrapeController.saveToDatabase);

// Get scraping history
router.get('/history', scrapeController.getHistory);

// Download CSV file
router.get('/download-csv', scrapeController.downloadCsv);

// Compare old and new data
router.get('/compare', scrapeController.compareData);

export default router; 