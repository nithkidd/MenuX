
import fs from 'fs';

try {
  const content = fs.readFileSync('test-output-4.log', 'utf8');
  console.log('LOG CONTENT START');
  console.log(content);
  console.log('LOG CONTENT END');
} catch (err) {
  console.error('Error reading log:', err);
}
