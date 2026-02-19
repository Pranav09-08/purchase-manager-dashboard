// Frontend debugging test - add this to AdminPanel to verify token flow
// Open browser console and run: testAuthFlow()

export const testAuthFlow = async () => {
  console.log('\n🧪 Testing Authentication Flow...\n');

  // Step 1: Check localStorage
  console.log('Step 1: Checking localStorage...');
  const adminToken = localStorage.getItem('adminToken');
  console.log('  adminToken exists:', !!adminToken);
  console.log('  adminToken preview:', adminToken ? adminToken.substring(0, 50) + '...' : 'MISSING');
  
  if (!adminToken) {
    console.error('❌ FAILED: No adminToken in localStorage');
    return;
  }

  // Step 2: Test /api/debug/headers (no auth needed)
  console.log('\nStep 2: Testing /api/debug/headers (public endpoint)...');
  try {
    const response1 = await fetch('http://localhost:3000/api/debug/headers');
    const data1 = await response1.json();
    console.log('  Server response:', data1);
  } catch (err) {
    console.error('  ❌ Error:', err);
  }

  // Step 3: Test sending headers
  console.log('\nStep 3: Testing header transmission...');
  const headers = { Authorization: `Bearer ${adminToken}` };
  console.log('  Sending headers:', headers);

  try {
    const response2 = await fetch('http://localhost:3000/api/debug/headers', {
      headers: headers,
    });
    const data2 = await response2.json();
    console.log('  Server received headers:', data2.headers);
    console.log('  Authorization header:', data2.authorization);
  } catch (err) {
    console.error('  ❌ Error:', err);
  }

  // Step 4: Test authenticateToken middleware
  console.log('\nStep 4: Testing /api/debug/test-auth (requires token)...');
  try {
    const response3 = await fetch('http://localhost:3000/api/debug/test-auth', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data3 = await response3.json();
    if (response3.ok) {
      console.log('  ✅ Authentication successful!');
      console.log('  User data:', data3.user);
    } else {
      console.error('  ❌ Authentication failed:', data3);
    }
  } catch (err) {
    console.error('  ❌ Error:', err);
  }

  // Step 5: Test actual protected endpoint
  console.log('\nStep 5: Testing actual protected endpoint (/api/purchase/enquiries)...');
  try {
    const response4 = await fetch('http://localhost:3000/api/purchase/enquiries', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data4 = await response4.json();
    if (response4.ok) {
      console.log('  ✅ Endpoint accessible!');
      console.log('  Response:', data4);
    } else {
      console.error('  ❌ Endpoint failed:', data4);
    }
  } catch (err) {
    console.error('  ❌ Error:', err);
  }

  console.log('\n✅ Testing complete!\n');
};
