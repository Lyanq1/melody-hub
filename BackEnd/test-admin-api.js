import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test data
const testUser = {
  username: 'testadmin',
  password: 'password123',
  email: 'testadmin@example.com',
  displayName: 'Test Admin',
  role: 'Admin'
};

// Test functions
async function testRegister() {
  console.log('\n=== Testing Register ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Register successful:', response.data);
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ User already exists, continuing...');
    } else {
      console.log('❌ Register failed:', error.response?.data || error.message);
    }
  }
}

async function testLogin() {
  console.log('\n=== Testing Login ===');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful');
    console.log('User role:', response.data.user.role);
    console.log('Token received:', authToken ? 'Yes' : 'No');
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
  }
}

async function testDashboardAccess() {
  console.log('\n=== Testing Dashboard Access ===');
  try {
    const response = await axios.get(`${BASE_URL}/auth/dashboard/access`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Dashboard access granted:', response.data);
  } catch (error) {
    console.log('❌ Dashboard access failed:', error.response?.data || error.message);
  }
}

async function testGetCurrentUser() {
  console.log('\n=== Testing Get Current User ===');
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Current user info:', response.data);
  } catch (error) {
    console.log('❌ Get current user failed:', error.response?.data || error.message);
  }
}

async function testGetAllUsers() {
  console.log('\n=== Testing Get All Users ===');
  try {
    const response = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ All users retrieved:', response.data.length, 'users');
  } catch (error) {
    console.log('❌ Get all users failed:', error.response?.data || error.message);
  }
}

async function testGetSystemStats() {
  console.log('\n=== Testing Get System Stats ===');
  try {
    const response = await axios.get(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ System stats:', response.data);
  } catch (error) {
    console.log('❌ Get system stats failed:', error.response?.data || error.message);
  }
}

async function testSearchUsers() {
  console.log('\n=== Testing Search Users ===');
  try {
    const response = await axios.get(`${BASE_URL}/admin/users/search?query=test&role=Admin`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User search results:', response.data);
  } catch (error) {
    console.log('❌ User search failed:', error.response?.data || error.message);
  }
}

async function testUnauthorizedAccess() {
  console.log('\n=== Testing Unauthorized Access ===');
  try {
    // Test without token
    const response = await axios.get(`${BASE_URL}/admin/users`);
    console.log('❌ Should have failed without token:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      console.log('❌ Unexpected error:', error.response?.data || error.message);
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Admin API Tests...\n');
  
  try {
    await testRegister();
    await testLogin();
    
    if (authToken) {
      await testDashboardAccess();
      await testGetCurrentUser();
      await testGetAllUsers();
      await testGetSystemStats();
      await testSearchUsers();
      await testUnauthorizedAccess();
    } else {
      console.log('❌ Cannot continue tests without authentication token');
    }
    
    console.log('\n✨ All tests completed!');
  } catch (error) {
    console.error('💥 Test runner error:', error.message);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };

