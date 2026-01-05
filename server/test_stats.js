// Node 22 has global fetch

async function test() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@greeva.tech', password: 'admin123' })
        });

        if (!loginRes.ok) {
            console.error('Login Failed', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Got Token:', token ? 'Yes' : 'No');

        // 2. Fetch Stats
        console.log('Fetching Stats...');
        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
            headers: { 'x-auth-token': token }
        });

        if (!statsRes.ok) {
            console.error('Stats Failed', await statsRes.text());
            return;
        }

        const statsData = await statsRes.json();
        console.log('Stats Data:', JSON.stringify(statsData, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

test();
