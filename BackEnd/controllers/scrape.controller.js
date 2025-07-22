import { loadConfig, saveConfig, updateSchedule, runScraping, startScheduler, stopScheduler } from '../scrape/scheduler.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Global variable to track scraping status
let scrapingStatus = {
  isRunning: false,
  startTime: null,
  endTime: null,
  progress: 0,
  message: ''
};

/**
 * Get scraper configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getConfig = (req, res) => {
  try {
    const config = loadConfig();
    res.json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Update scraper configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateConfig = (req, res) => {
  try {
    const config = loadConfig();
    
    // Update schedule if provided
    if (req.body.schedule) {
      if (typeof req.body.schedule.enabled === 'boolean') {
        config.schedule.enabled = req.body.schedule.enabled;
      }
      
      if (req.body.schedule.cronExpression) {
        config.schedule.cronExpression = req.body.schedule.cronExpression;
      }
      
      if (typeof req.body.schedule.autoSaveToDb === 'boolean') {
        config.schedule.autoSaveToDb = req.body.schedule.autoSaveToDb;
      }
    }
    
    // Update sources if provided
    if (req.body.sources) {
      // Validate sources
      if (!Array.isArray(req.body.sources)) {
        return res.status(400).json({
          success: false,
          message: 'Sources must be an array'
        });
      }
      
      config.sources = req.body.sources;
    }
    
    saveConfig(config);
    
    // Restart scheduler with new configuration
    stopScheduler();
    if (config.schedule.enabled) {
      startScheduler();
    }
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Trigger manual scraping
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const triggerScraping = async (req, res) => {
  try {
    const saveToDb = req.body.saveToDb === true;
    
    // Update scraping status
    scrapingStatus = {
      isRunning: true,
      startTime: new Date().toISOString(),
      endTime: null,
      progress: 0,
      message: 'Scraping started'
    };
    
    // Start scraping in the background
    res.json({
      success: true,
      message: `Scraping process started${saveToDb ? ' with database update' : ''}`,
      timestamp: new Date().toISOString(),
      saveToDb
    });
    
    // Run scraping after sending response
    try {
      const results = await runScraping(saveToDb);
      console.log('Scraping completed with results:', JSON.stringify(results, null, 2));
      
      // Update scraping status
      scrapingStatus = {
        isRunning: false,
        startTime: scrapingStatus.startTime,
        endTime: new Date().toISOString(),
        progress: 100,
        message: 'Scraping completed successfully'
      };
    } catch (scrapingError) {
      console.error('Error during scraping process:', scrapingError);
      
      // Update scraping status
      scrapingStatus = {
        isRunning: false,
        startTime: scrapingStatus.startTime,
        endTime: new Date().toISOString(),
        progress: 0,
        message: `Error: ${scrapingError.message}`
      };
    }
  } catch (error) {
    console.error('Error initiating scraping process:', error);
    // Error is logged but not returned since response is already sent
  }
};

/**
 * Get current scraping status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getScrapingStatus = (req, res) => {
  try {
    res.json({
      success: true,
      status: scrapingStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Save scraped data to database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const saveToDatabase = async (req, res) => {
  try {
    const csvPath = path.join(__dirname, '../scrape/products.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'CSV file not found. Please run scraping first.'
      });
    }
    
    const results = await saveScrapedProductsToDatabase(csvPath);
    
    res.json({
      success: true,
      message: 'Products saved to database',
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get scraping history (from logs)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getHistory = (req, res) => {
  try {
    const config = loadConfig();
    const csvPath = path.join(__dirname, '../scrape/products.csv');
    
    let csvStats = null;
    if (fs.existsSync(csvPath)) {
      const stats = fs.statSync(csvPath);
      csvStats = {
        path: csvPath,
        size: stats.size,
        modified: stats.mtime
      };
    }
    
    res.json({
      success: true,
      lastRun: config.lastRun,
      csvFile: csvStats,
      scrapingStatus: scrapingStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Download the latest CSV file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const downloadCsv = (req, res) => {
  try {
    const csvPath = path.join(__dirname, '../scrape/products.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'CSV file not found'
      });
    }
    
    res.download(csvPath, 'products.csv');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Compare old and new data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const compareData = async (req, res) => {
  try {
    const csvPath = path.join(__dirname, '../scrape/products.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'CSV file not found'
      });
    }
    
    // Read current CSV data
    const csvData = fs.readFileSync(csvPath, 'utf8');
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    // Parse CSV into objects
    const currentProducts = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const product = {};
      
      for (let j = 0; j < headers.length; j++) {
        product[headers[j]] = values[j] || '';
      }
      
      currentProducts.push(product);
    }
    
    // Run new scraping
    const newResults = await runScraping(false);
    
    // Compare results
    const comparison = {
      timestamp: new Date().toISOString(),
      previousCount: currentProducts.length,
      newCount: 0,
      added: [],
      updated: [],
      unchanged: []
    };
    
    if (newResults.sources && newResults.sources.length > 0) {
      const source = newResults.sources.find(s => s.name === 'hangDiaThoiDai');
      if (source) {
        comparison.newCount = source.count;
      }
    }
    
    res.json({
      success: true,
      comparison
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 