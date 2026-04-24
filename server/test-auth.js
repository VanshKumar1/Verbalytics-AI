const http = require('http');

function makeRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('\n=== Verbalytics AI — Auth API Tests ===\n');

  // 1. Health Check
  const health = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('1. Health Check:', health.status === 200 ? '✅ PASS' : '❌ FAIL');
  console.log('   Response:', JSON.stringify(health.body));

  // 2. Register
  const regBody = JSON.stringify({ name: 'Test User', email: 'test@verbalytics.com', password: 'test123' });
  const reg = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(regBody) }
  }, regBody);
  console.log('\n2. Register:', (reg.status === 201 || reg.status === 409) ? '✅ PASS' : '❌ FAIL');
  console.log('   Status:', reg.status);
  if (reg.body.user) console.log('   User:', reg.body.user.name, '|', reg.body.user.email);
  if (reg.body.token) console.log('   Token:', reg.body.token.substring(0, 40) + '...');
  if (reg.body.error) console.log('   Message:', reg.body.error);

  // 3. Login
  const loginBody = JSON.stringify({ email: 'test@verbalytics.com', password: 'test123' });
  const login = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginBody) }
  }, loginBody);
  console.log('\n3. Login:', login.status === 200 ? '✅ PASS' : '❌ FAIL');
  console.log('   Status:', login.status);
  if (login.body.user) console.log('   User:', login.body.user.name, '|', login.body.user.email);
  if (login.body.token) console.log('   Token:', login.body.token.substring(0, 40) + '...');

  // 4. Wrong password
  const wrongBody = JSON.stringify({ email: 'test@verbalytics.com', password: 'wrongpassword' });
  const wrong = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(wrongBody) }
  }, wrongBody);
  console.log('\n4. Wrong Password:', wrong.status === 401 ? '✅ PASS (correctly rejected)' : '❌ FAIL');
  console.log('   Error:', wrong.body.error);

  // 5. Protected route without token
  const noToken = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/auth/me', method: 'GET' });
  console.log('\n5. Protected /me (no token):', noToken.status === 401 ? '✅ PASS (blocked correctly)' : '❌ FAIL');
  console.log('   Error:', noToken.body.error);

  // 6. Protected route WITH token
  const token = login.body.token;
  const me = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/me', method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('\n6. Protected /me (with token):', me.status === 200 ? '✅ PASS' : '❌ FAIL');
  if (me.body.user) console.log('   User:', me.body.user.name, '|', me.body.user.email);

  console.log('\n=== All tests complete! ===\n');
}

runTests().catch(console.error);
