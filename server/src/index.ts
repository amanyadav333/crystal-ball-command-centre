import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  OomniEye Approvals Assistant AI Backend`);
  console.log(`  Running on http://localhost:${PORT}`);
  console.log(`  OpenAPI Contract: http://localhost:${PORT}/api/openapi.json`);
  console.log(`  Health Check: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});
