try {
  const { Users } = require('./src/payload/collections/system/Users');
  console.log('Users collection loaded successfully');
} catch(e) {
  console.error('Error loading Users collection:', e.message);
}
