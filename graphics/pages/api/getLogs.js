const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    const logPath = path.resolve(process.cwd(), 'parser/logs/parser.log');
    if (!fs.existsSync(logPath)) {
        res.writeHead(200, {
            'Content-Type' : 'text/plain'
        });

        res.write('log file was not found');
        return res.end();
    }

    let stat;
    try {
        stat = fs.statSync(logPath);
    } catch (e) {
    }

    if (!stat?.size) {
        res.writeHead(200, {
            'Content-Type' : 'text/plain'
        });

        res.write('log file is empty');
        return res.end();
    }

    res.writeHead(200, {
        'Content-Type': "application/force-download",
        'Content-Transfer-Encoding': "binary",
        'Content-Length': stat?.size ? stat.size : 0,
        'Content-Disposition': 'attachment; filename="parser.log"',
    });

    if (!stat.size) {
        return res.end();
    }

    try {
        const logFile = fs.createReadStream(logPath);
        logFile.pipe(res);
    } catch (e) {
        res.writeHead(500);
    }

    res.end()
}
