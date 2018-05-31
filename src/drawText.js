import Jimp from 'jimp';

const drawRectangle = (image, x1, x2, y1, y2) => {
    for (let x = x1; x < x2; x += 1) {
        for (let y = y1; y < y2; y += 1) { image.setPixelColor(0x000000FF, x, y); }
    }
};

export const drawText = async ({ image, data }) => {
    const font = await Jimp.loadFont('./public/font.fnt');
    // console.log(font);
    const estimatedTextLenght = data.summary.length * 16;
    const estimatedTextHeight = 25;
    const y = image.bitmap.height - 130;
    const x = (image.bitmap.width / 2) - (estimatedTextLenght / 2);
    image.print(font, x, y, data.summary);
    const linewidth = image.bitmap.width * 0.6;
    const lineX = (image.bitmap.width / 2) - (linewidth / 2);
    const lineYPos = y + estimatedTextHeight + 10;
    drawRectangle(image, lineX, lineX + linewidth, lineYPos, lineYPos + 2);

    let tempText = `${data.tempMin}.`;
    const estimatedTempLength = tempText.length * 16;
    tempText += `${data.tempMax}`;
    console.log(tempText);
    const tempX = (image.bitmap.width / 2) - estimatedTempLength;
    image.print(font, tempX, lineYPos + 12, tempText);
};
