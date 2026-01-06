const dns = require('dns');

const srvAddress = '_mongodb._tcp.hydroponic.6aenydg.mongodb.net';

console.log(`Resolving SRV for: ${srvAddress}`);

dns.resolveSrv(srvAddress, (err, addresses) => {
    if (err) {
        console.error('DNS Resolution Error:', err);
        return;
    }

    console.log('✅ SRV Record Resolved!');
    const hosts = addresses.map(a => `${a.name}:${a.port}`).join(',');

    // Construct the long connection string template
    const longURI = `mongodb://ankitsingh12326434_db_user:<PASSWORD>@${hosts}/hydroponic?ssl=true&replicaSet=atlas-13ld4l-shard-0&authSource=admin&retryWrites=true&w=majority`;

    const fs = require('fs');
    fs.writeFileSync('server/mongo_uri.txt', longURI);
    console.log('URI saved to server/mongo_uri.txt');
});
