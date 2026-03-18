const Jimp = require('jimp');

async function removeBg() {
    try {
        console.log('Reading image...');
        // The user's new logo with checkerboard background
        const image = await Jimp.read('public/assets/images/new-logo.jpg');

        console.log('Processing pixels...');
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // Remove checkerboard and white (light grays and whites)
            // The checkerboard usually consists of colors > 200
            // but the logo text is orange/blue. Orange is > 200 in Red, but low in Green/Blue.
            // A pixel is grayscale-ish background if R, G, and B are all high and relatively close to each other.

            if (r > 210 && g > 210 && b > 210) {
                this.bitmap.data[idx + 3] = 0; // Transparent
            }
        });

        // Crop excessive whitespace/transparency if needed (Jimp autocrop can do it)
        image.autocrop();

        await image.writeAsync('public/assets/images/clean-logo.png');
        console.log('Success! Saved as clean-logo.png');
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

removeBg();
