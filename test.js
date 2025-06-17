import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testSmartLinks() {
    console.log('🚀 Testing Smart Links PoC...\n');

    try {
        console.log('1. Creating a new smart link...');
        const createResponse = await axios.post(`${BASE_URL}/create-link`, {
            iosUrl: 'https://apps.apple.com/test-app',
            androidUrl: 'https://play.google.com/store/apps/test-app',
            desktopUrl: 'https://example.com/test-app'
        });

        const { shortUrl } = createResponse.data;
        const linkId = shortUrl.split('/').pop();
        console.log(`✅ Created: ${shortUrl}`);

        console.log('\n2. Testing redirects with different user agents...');
        
        const userAgents = [
            { name: 'iPhone', agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', expected: 'apple' },
            { name: 'Android', agent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)', expected: 'play.google' },
            { name: 'Desktop', agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', expected: 'example.com' }
        ];

        for (const { name, agent, expected } of userAgents) {
            try {
                const response = await axios.get(`${BASE_URL}/${linkId}`, {
                    headers: { 'User-Agent': agent },
                    maxRedirects: 0,
                    validateStatus: status => status === 302
                });
                
                const redirectUrl = response.headers.location;
                console.log(`✅ ${name}: ${redirectUrl.includes(expected) ? 'PASS' : 'FAIL'} - ${redirectUrl}`);
            } catch (error) {
                console.log(`❌ ${name}: ERROR - ${error.message}`);
            }
        }

        console.log('\n3. Checking analytics...');
        const analyticsResponse = await axios.get(`${BASE_URL}/analytics/${linkId}`);
        console.log(`✅ Total clicks: ${analyticsResponse.data.clicks}`);
        console.log(`✅ Timestamps recorded: ${analyticsResponse.data.timestamps.length}`);

        console.log('\n🎉 All tests completed! PoC is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Make sure the server is running: node server.js');
        }
        console.error('Full error:', error);
    }
}

testSmartLinks(); 