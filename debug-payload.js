import { getPayloadClient } from './src/payload.js';

async function testPayload() {
  try {
    console.log('Testing Payload client creation...');
    const payload = await getPayloadClient();
    console.log('Payload client created successfully');

    const users = await payload.find({
      collection: 'users',
      limit: 1
    });
    console.log('Users query successful:', users.totalDocs);

  } catch (error) {
    console.error('Payload test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPayload();
