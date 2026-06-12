// scratch/check_dev_server.js
const http = require('http');

http.get('http://localhost:3000/hrms-login?redirect_to=%2Fdashboard', (res) => {
    console.log('Dev Server Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Content Length:', data.length);
        console.log('Preview:', data.slice(0, 300));
        process.exit(0);
    });
}).on('error', (err) => {
    console.error('Dev Server Error:', err);
    process.exit(1);
});
