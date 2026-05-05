"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const API_URL = 'http://localhost:8000/api/v1';
const TEST_EMAIL = `testbuyer_${Date.now()}@example.com`;
const TEST_PASSWORD = 'StrongPass1!';
async function runTest() {
    console.log('--- Starting Full Order Flow Test ---');
    try {
        console.log('\n1. Registering Buyer...');
        await axios_1.default.post(`${API_URL}/auth/buyer/register`, {
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
        console.log('\n2. Logging in...');
        const loginRes = await axios_1.default.post(`${API_URL}/auth/buyer/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
        });
        const token = loginRes.data.data.access_token;
        console.log('✅ Logged in');
        const headers = { Authorization: `Bearer ${token}` };
        console.log('\n3. Adding item to cart...');
        await axios_1.default.post(`${API_URL}/cart`, {
            productId: '081c9020-8cd6-4ddf-9edd-9d0e0f4bbcac',
            quantity: 2,
        }, { headers });
        console.log('✅ Item added');
        console.log('\n4. Saving address...');
        await axios_1.default.post(`${API_URL}/cart/address`, {
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
        console.log('\n5. Getting order summary...');
        const summaryRes = await axios_1.default.get(`${API_URL}/cart/summary`, { headers });
        console.log('✅ Summary:', JSON.stringify(summaryRes.data, null, 2));
        console.log('\n6. Checking out...');
        const checkoutRes = await axios_1.default.post(`${API_URL}/cart/checkout`, {}, { headers });
        console.log('✅ Checkout Successful:', JSON.stringify(checkoutRes.data, null, 2));
        console.log('\n--- Test Completed Successfully ---');
    }
    catch (error) {
        console.error('\n❌ Test Failed:', error.response?.data || error.message);
    }
}
runTest();
//# sourceMappingURL=test-order-flow.js.map