import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

async function testApi() {
  console.log('Testing API endpoints...');
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('Health endpoint response:', healthData);
    
    // Test scrape config endpoint
    console.log('\n2. Testing scrape config endpoint...');
    const configResponse = await fetch(`${API_URL}/scrape/config`);
    const configData = await configResponse.json();
    console.log('Scrape config response:', configData);
    
    // Test scrape history endpoint
    console.log('\n3. Testing scrape history endpoint...');
    const historyResponse = await fetch(`${API_URL}/scrape/history`);
    const historyData = await historyResponse.json();
    console.log('Scrape history response:', historyData);
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi(); 