
import fs from 'fs';
import path from 'path';

const dirs = [
  'src/features/auth/components',
  'src/features/auth/pages',
  'src/features/auth/services',
  'src/features/auth/hooks',
  'src/features/business/components',
  'src/features/business/pages',
  'src/features/business/services',
  'src/features/menu/components',
  'src/features/menu/pages',
  'src/features/menu/services',
  'src/shared/components',
  'src/shared/contexts',
  'src/shared/hooks',
  'src/shared/types',
  'src/shared/utils'
];

dirs.forEach(d => {
  const p = path.join(process.cwd(), d);
  fs.mkdirSync(p, { recursive: true });
  console.log('Created:', p);
});
