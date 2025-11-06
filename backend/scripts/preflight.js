const requiredPackages = ['dotenv'];

const missing = [];

for (const pkg of requiredPackages) {
  try {
    await import(pkg);
  } catch (error) {
    missing.push(pkg);
  }
}

if (missing.length > 0) {
  console.error(`Missing runtime dependencies: ${missing.join(', ')}.`);
  console.error('Run `npm install` before starting the server.');
  process.exit(1);
}

console.log('Backend preflight check passed. All runtime dependencies are installed.');
