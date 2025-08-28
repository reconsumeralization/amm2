const lucide = require('lucide-react');

console.log('Available icons:', Object.keys(lucide).filter(k => k[0] === k[0].toUpperCase() && !k.includes('Icon')).slice(0, 10));

const testIcons = ['Calendar', 'Clock', 'MapPin', 'Users', 'Star', 'ExternalLink', 'Bold', 'Italic', 'Upload'];
testIcons.forEach(icon => {
  console.log(`${icon}:`, typeof lucide[icon]);
});
