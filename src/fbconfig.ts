import { ServiceAccount } from 'firebase-admin/lib/credential';
import { getEnvFile } from './functions/custom-function';
import * as path from 'path';
import { config } from 'dotenv';

const envFile = getEnvFile();
config({ path: path.resolve(process.cwd(), envFile) });

export const fbConfig: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};
