/**
 * Test Sprint 2 API Integration
 *
 * Usage: node test-api.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

// Seoul City Hall coordinates
const TEST_LOCATION = {
  lat: 37.5665,
  lng: 126.9780
};

async function testAPI() {
  console.log('='.repeat(60));
  console.log('Sprint 2 Day 6: Service/Controller Integration Test');
  console.log('='.repeat(60));
  console.log('');

  // Test 1: Default radius (5km)
  console.log('Test 1: Default radius=5');
  try {
    const response1 = await axios.get(`${BASE_URL}/centers`, {
      params: {
        lat: TEST_LOCATION.lat,
        lng: TEST_LOCATION.lng
      }
    });

    console.log('✅ Status:', response1.status);
    console.log('✅ Response structure:', {
      success: response1.data.success,
      centersCount: response1.data.data.centers.length,
      total: response1.data.data.total,
      radius: response1.data.data.radius,
      userLocation: response1.data.data.userLocation,
      hasMore: response1.data.data.hasMore,
      nextOffset: response1.data.data.nextOffset
    });

    if (response1.data.data.centers.length > 0) {
      const firstCenter = response1.data.data.centers[0];
      console.log('✅ First center:', {
        name: firstCenter.name,
        distance: firstCenter.distance + 'm',
        walkTime: firstCenter.walkTime,
        operatingStatus: firstCenter.operatingStatus
      });
    }
  } catch (error) {
    console.log('❌ Test 1 failed:', error.response?.data || error.message);
  }
  console.log('');

  // Test 2: radius=10
  console.log('Test 2: radius=10');
  try {
    const response2 = await axios.get(`${BASE_URL}/centers`, {
      params: {
        lat: TEST_LOCATION.lat,
        lng: TEST_LOCATION.lng,
        radius: '10'
      }
    });

    console.log('✅ Status:', response2.status);
    console.log('✅ Response:', {
      centersCount: response2.data.data.centers.length,
      radius: response2.data.data.radius,
      hasMore: response2.data.data.hasMore
    });
  } catch (error) {
    console.log('❌ Test 2 failed:', error.response?.data || error.message);
  }
  console.log('');

  // Test 3: radius=all with pagination
  console.log('Test 3: radius=all with pagination');
  try {
    const response3 = await axios.get(`${BASE_URL}/centers`, {
      params: {
        lat: TEST_LOCATION.lat,
        lng: TEST_LOCATION.lng,
        radius: 'all',
        offset: 0,
        limit: 10
      }
    });

    console.log('✅ Status:', response3.status);
    console.log('✅ Response:', {
      centersCount: response3.data.data.centers.length,
      radius: response3.data.data.radius,
      hasMore: response3.data.data.hasMore,
      nextOffset: response3.data.data.nextOffset
    });
  } catch (error) {
    console.log('❌ Test 3 failed:', error.response?.data || error.message);
  }
  console.log('');

  // Test 4: Invalid radius (should fail)
  console.log('Test 4: Invalid radius=7 (should fail with 400)');
  try {
    const response4 = await axios.get(`${BASE_URL}/centers`, {
      params: {
        lat: TEST_LOCATION.lat,
        lng: TEST_LOCATION.lng,
        radius: '7'
      }
    });
    console.log('❌ Should have failed but got:', response4.status);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected invalid radius:', error.response.data.error?.message);
    } else {
      console.log('❌ Wrong error:', error.response?.data || error.message);
    }
  }
  console.log('');

  console.log('='.repeat(60));
  console.log('API Integration Tests Complete');
  console.log('='.repeat(60));
}

testAPI().catch(console.error);
