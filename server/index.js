// ParimaN - Express Server (Local Development)
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`\n🏛️  ParimaN API Server running on http://localhost:${PORT}`);
  console.log(`   Legal Metrology Verification System - SIH 2026\n`);
});
