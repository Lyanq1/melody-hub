import { scrapeHangDiaThoiDai } from './hangDiaThoiDaiScraper.js';
import { loadConfig, updateSchedule, runScraping } from './scheduler.js';

async function testScraper() {
  console.log('Testing scraper functionality...');
  
  // Test configuration loading
  const config = loadConfig();
  console.log('Current configuration:', JSON.stringify(config, null, 2));
  
  // Test direct scraping
  console.log('\nTesting direct scraping...');
  try {
    const products = await scrapeHangDiaThoiDai(false); // Don't save to DB in test
    console.log(`Successfully scraped ${products.length} products`);
    console.log('First 3 products:', JSON.stringify(products.slice(0, 3), null, 2));
  } catch (error) {
    console.error('Error in direct scraping:', error);
  }
  
  // Test scheduler
  console.log('\nTesting scheduler...');
  try {
    // Update schedule to run every minute for testing
    updateSchedule(true, '* * * * *');
    console.log('Schedule updated to run every minute');
    
    // Run manual scraping
    console.log('\nTesting manual scraping...');
    const results = await runScraping();
    console.log('Manual scraping results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Error in scheduler test:', error);
  }
  
  console.log('\nTest completed!');
}

testScraper().catch(console.error); 