const fs = require('fs');
const path = require('path');

const accountDir = path.join(__dirname, 'app', 'account');
if (!fs.existsSync(accountDir)) {
  fs.mkdirSync(accountDir, { recursive: true });
  console.log('Account directory created');
} else {
  console.log('Account directory already exists');
}
