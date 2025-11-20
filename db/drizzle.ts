import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

config({ path: ".env" }); // or .env.local

// Create postgres connection
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);

import * as schema from "./schema";

// Initialize drizzle with postgres client
export const db = drizzle(client, { schema });
// fied it works. I'll now create a walkthrough to document what I did.