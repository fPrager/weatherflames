import https from 'https';

const requestWeather = (data) => {
    return new Promise((resolve, reject) => {
        https.get({
            hostname: 'api.darksky.net',
            path: `/forecast/${data.darkKey}/${data.lat},${data.lon}?units=ca`,
            method: 'GET',
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve(JSON.parse(body));
            });
            res.on('error', (e) => {
                reject(e);
            });
        });
    });
    // const darksky = new DarkSky(data.darkKey);


    /* console.log(data);
    return darksky
        .coordinates({ lat: `${data.lat}`, lng: `${data.lon}` })
        .language('en')
        .units('de')
        .get(); */
};

export const loadWeatherString = async ({ lat = 40.3482922, lon = -74.7398824, darkKey } = {}) => {
    if (darkKey === undefined) {
        return {
            summary: 'Missing DarkSky-API-Key',
            tempMin: 0,
            tempMax: 0,
            seed: `s${Math.random()}`,
        };
    }

    try {
        const weather = await requestWeather({ lat, lon, darkKey });
        return {
            summary: weather.hourly.summary,
            tempMin: Math.round(weather.daily.data[0].temperatureLow),
            tempMax: Math.round(weather.daily.data[0].temperatureHigh),
            seed: weather.hourly.icon,
        };
    } catch (error) {
        return {
            summary: error,
            tempMin: 0,
            tempMax: 0,
            seed: `s${Math.random()}`,
        };
    }
};
