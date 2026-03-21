const http = require('http');

async function testLogin() {
  try {
    console.log('🧪 测试登录API...\n');

    // 测试1: 健康检查
    console.log('1️⃣ 健康检查:');
    const healthData = await makeRequest('GET', '/api/health');
    console.log('✅ 后端正常运行:', JSON.parse(healthData));

    // 测试2: 登录
    console.log('\n2️⃣ 测试登录:');
    const loginData = await makeRequest('POST', '/api/auth/login', {
      username: 'student1',
      password: '123456'
    });
    const loginResult = JSON.parse(loginData);
    console.log('✅ 登录成功');
    console.log('   用户:', loginResult.data.user.username);
    console.log('   Token:', loginResult.data.token.substring(0, 50) + '...');

    console.log('\n✅ 测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3006,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

testLogin();
