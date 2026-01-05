// Test script to check widget API endpoints
const testWidgetAPI = async () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNjc3YjVhNzE5YzI4YjQwMDEzZjg0YzJhIiwicm9sZSI6ImFkbWluIn0sImlhdCI6MTczNjA5NTYzNSwiZXhwIjoxNzM2MDk5MjM1fQ.test'; // You'll need to get real token

    const endpoints = [
        'users-with-devices',
        'users-without-devices',
        'total-users'
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`\n=== Testing ${endpoint} ===`);
            const res = await fetch(`http://localhost:5000/api/admin/widget/${endpoint}`, {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            console.log(`Status: ${res.status}`);
            console.log(`Data length: ${data.length}`);
            console.log('Sample data:', JSON.stringify(data.slice(0, 2), null, 2));
        } catch (err) {
            console.error(`Error testing ${endpoint}:`, err.message);
        }
    }
};

// For Node.js 18+
testWidgetAPI();
