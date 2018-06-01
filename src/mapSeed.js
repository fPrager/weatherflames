import fs from 'fs';
import path from 'path';

export const mapSeed = (seed) => {
    const map = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/sampleSeedMap.json')));
    return (map[seed] || seed);
};
