import request from 'request';

import path from 'path';
import fs from 'fs';


export const mapSeed = (seed) => {
    return new Promise((resolve) => {
        if (!process.env.SEED_MAP_URL) {
            console.log('using local seed map');
            const map = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/sampleSeedMap.json')));
            resolve(map[seed] || seed);
            return;
        }
        request(process.env.SEED_MAP_URL, (error, res) => {
            if (!error && res.statusCode === 200) {
                const map = JSON.parse(res.body);
                resolve(map[seed] || seed);
            } else {
                console.log('cant read reach online seed map');
                const map = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/sampleSeedMap.json')));
                resolve(map[seed] || seed);
            }
        });
    });
};
