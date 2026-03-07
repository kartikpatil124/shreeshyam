const fs = require('fs');
const { Jimp } = require('jimp');
const src = 'C:\\Users\\karti\\.gemini\\antigravity\\brain\\b41290dd-d6af-4300-b832-d1f2a0c027c5\\media__1772908078418.jpg';
const dest = 'public/assets/images/clean-logo.png';

async function run() {
    try {
        console.log('Reading:', src);
        const image = await Jimp.read(src);

        console.log('Processing transparency and finding bounding box...');
        let minX = image.bitmap.width, maxX = 0;
        let minY = image.bitmap.height, maxY = 0;

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // Remove checkerboard and white
            if (r > 180 && g > 180 && b > 180) {
                this.bitmap.data[idx + 3] = 0; // Transparent
            } else if (x > 10 && y > 10 && x < image.bitmap.width - 10 && y < image.bitmap.height - 10) {
                // If it's part of the logo (and ignore possible 10px image frame edges), track bounding box
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        });

        // Crop to bounding box with small padding
        const padding = 10;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(image.bitmap.width - cropX, maxX - minX + 1 + padding * 2);
        const cropH = Math.min(image.bitmap.height - cropY, maxY - minY + 1 + padding * 2);

        console.log(`Cropping to ${cropW}x${cropH} at (${cropX}, ${cropY})`);

        // Use 'crop' explicitly (Jimp new API logic)
        // If crop isn't available directly, we can use crop(x,y,w,h)
        // Note: jimp.crop takes object { x, y, w, h } in new version or coordinates in older.
        // We'll use coordinates format

        const croppedImage = image.crop({ x: cropX, y: cropY, w: cropW, h: cropH });
        await croppedImage.write(dest);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
