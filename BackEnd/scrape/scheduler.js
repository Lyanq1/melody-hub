import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrapeHangDiaThoiDai } from './hangDiaThoiDaiScraper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, 'scrape-config.json');

// Default configuration
const defaultConfig = {
  schedule: {
    enabled: true,
    cronExpression: '0 0 * * *' // Daily at midnight
  },
  lastRun: null,
  sources: [
    {
      name: 'hangDiaThoiDai',
      enabled: true,
      url: 'https://store.hangdiathoidai.com/collections/available-now'
    }
  ]
};

/**
 * Load scraper configuration
 * @returns {Object} Configuration object
 */
export function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config;
    }
    
    // If config doesn't exist, create default one
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    return defaultConfig;
  } catch (error) {
    console.error('Error loading scraper config:', error);
    return defaultConfig;
  }
}

/**
 * Save scraper configuration
 * @param {Object} config - Configuration to save
 */
export function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving scraper config:', error);
  }
}

/**
 * Update scraper schedule
 * @param {boolean} enabled - Whether scheduling is enabled
 * @param {string} cronExpression - Cron expression for scheduling
 */
export function updateSchedule(enabled, cronExpression) {
  const config = loadConfig();
  config.schedule.enabled = enabled;
  
  if (cronExpression) {
    // Validate cron expression
    if (!cron.validate(cronExpression)) {
      throw new Error('Invalid cron expression');
    }
    config.schedule.cronExpression = cronExpression;
  }
  
  saveConfig(config);
  
  // Restart scheduler
  stopScheduler();
  if (enabled) {
    startScheduler();
  }
  
  return config;
}

// Scheduled job reference
let scheduledJob = null;

/**
 * Start the scraper scheduler
 */
export function startScheduler() {
  const config = loadConfig();
  
  if (!config.schedule.enabled) {
    console.log('Scheduler is disabled in configuration');
    return;
  }
  
  // Stop existing job if any
  stopScheduler();
  
  // Schedule new job
  scheduledJob = cron.schedule(config.schedule.cronExpression, async () => {
    console.log('Running scheduled scraping job at:', new Date().toISOString());
    await runScraping();
  });
  
  console.log(`Scheduler started with cron expression: ${config.schedule.cronExpression}`);
}

/**
 * Stop the scraper scheduler
 */
export function stopScheduler() {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
    console.log('Scheduler stopped');
  }
}

/**
 * Run scraping process manually
 * @returns {Promise<Object>} Result of scraping operation
 */
export async function runScraping() {
  const config = loadConfig();
  const results = {
    timestamp: new Date().toISOString(),
    sources: []
  };
  
  // Run enabled scrapers
  for (const source of config.sources) {
    if (source.enabled) {
      console.log(`Running scraper for: ${source.name}`);
      
      try {
        let products = [];
        
        // Run appropriate scraper based on source name
        if (source.name === 'hangDiaThoiDai') {
          products = await scrapeHangDiaThoiDai(true);
        }
        // Add more sources here as needed
        
        results.sources.push({
          name: source.name,
          status: 'success',
          count: products.length
        });
      } catch (error) {
        console.error(`Error running scraper for ${source.name}:`, error);
        results.sources.push({
          name: source.name,
          status: 'error',
          error: error.message
        });
      }
    }
  }
  
  // Update last run time
  config.lastRun = results.timestamp;
  saveConfig(config);
  
  return results;
}

// Start scheduler when this module is imported
startScheduler();

// Allow direct execution of this file
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runScraping().then(console.log).catch(console.error);
} 