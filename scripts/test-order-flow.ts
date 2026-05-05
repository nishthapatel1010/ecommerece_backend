import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://localhost:8000/api/v1';
const TEST_EMAIL = `testbuyer_${Date.now()}@example.com`;
const TEST_PASSWORD = 'StrongPass1!';

async function runTest() {
  console.log('--- Starting Full Order Flow Test ---');

  try {
    // 1. Register Buyer
    console.log('\n1. Registering Buyer...');
    await axios.post(`${API_URL}/auth/buyer/register`, {
      email: TEST_EMAIL,
      company_name: 'Test Beauty Co',
      address: '123 Test Street',
      city: 'Test City',
      state: 'NY',
      zipcode: '10001',
      company_phone: '+1234567890',
      password: TEST_PASSWORD,
      confirm_password: TEST_PASSWORD,
    });
    console.log('✅ Registered');

    // 2. Login Buyer
    console.log('\n2. Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/buyer/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    const token = loginRes.data.data.access_token;
    console.log('✅ Logged in');

    const headers = { Authorization: `Bearer ${token}` };

    // 3. Add Item to Cart
    // Using the product ID found earlier: 081c9020-8cd6-4ddf-9edd-9d0e0f4bbcac
    console.log('\n3. Adding item to cart...');
    await axios.post(`${API_URL}/cart`, {
      productId: '081c9020-8cd6-4ddf-9edd-9d0e0f4bbcac',
      quantity: 2,
    }, { headers });
    console.log('✅ Item added');

    // 4. Save Address
    console.log('\n4. Saving address...');
    await axios.post(`${API_URL}/cart/address`, {
      billCompany: 'Test Co',
      billAddress1: '123 Test St',
      billCity: 'Test City',
      billState: 'TS',
      billPostalcode: '12345',
      billEmail: TEST_EMAIL,
      phoneNumber: '1234567890',
      shipCompany: 'Ship Co',
      shipAddress1: '456 Ship St',
      shipCity: 'Ship City',
      shipState: 'SS',
      shipPostalcode: '54321',
      shippingMethod: 'trucking',
    }, { headers });
    console.log('✅ Address saved');

    // 5. Get Summary
    console.log('\n5. Getting order summary...');
    const summaryRes = await axios.get(`${API_URL}/cart/summary`, { headers });
    console.log('✅ Summary:', JSON.stringify(summaryRes.data, null, 2));

    // 6. Checkout
    console.log('\n6. Checking out...');
    const checkoutRes = await axios.post(`${API_URL}/cart/checkout`, {}, { headers });
    console.log('✅ Checkout Successful:', JSON.stringify(checkoutRes.data, null, 2));

    console.log('\n--- Test Completed Successfully ---');
  } catch (error: any) {
    console.error('\n❌ Test Failed:', error.response?.data || error.message);
  }
}

runTest();
