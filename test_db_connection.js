#!/usr/bin/env node

import { PrismaClient } from './lib/generated/prisma/index.js';

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Try to connect and perform a simple operation
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', result);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();