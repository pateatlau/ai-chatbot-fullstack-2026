import { defineConfig } from '@prisma/internals';

export const prismaConfig = defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
