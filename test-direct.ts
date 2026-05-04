import * as https from 'https';
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getServerTime(): Promise<number> {
  return new Promise((resolve, reject) => {
    https.get('https://api.cloudinary.com/v1_1/ping', (res) => {
      const dateStr = res.headers.date;
      if (dateStr) {
        resolve(Math.floor(new Date(dateStr).getTime() / 1000));
      } else {
        reject(new Error('No date header'));
      }
    }).on('error', reject);
  });
}

async function test() {
  try {
    const realTimestamp = await getServerTime();
    console.log('Real Cloudinary Server Timestamp:', realTimestamp);
    console.log('Local Machine Timestamp:', Math.floor(Date.now() / 1000));

    const result = await cloudinary.uploader.upload('test-image.png', {
      timestamp: realTimestamp,
    });
    console.log('Success:', result.secure_url);
  } catch (error) {
    console.error('Direct SDK Upload Failed:', error);
  }
}

test();
