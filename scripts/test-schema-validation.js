// Test script to verify Zod schema validation for role field
const { z } = require('zod');

const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  name: z.string().min(2).max(100),
  role: z
    .string()
    .transform((val) => (val === '' ? 'USER' : val))
    .pipe(z.enum(['USER', 'ADMIN'])),
});

console.log('Testing CreateUserSchema role validation...\n');

// Test 1: ADMIN role
console.log('Test 1: role = "ADMIN"');
try {
  const result1 = CreateUserSchema.parse({
    email: 'test@example.com',
    password: 'TestPass123!',
    name: 'Test User',
    role: 'ADMIN',
  });
  console.log('✅ PASSED - Result role:', result1.role);
} catch (e) {
  console.log('❌ FAILED -', e.message);
}

console.log('\nTest 2: role = "USER"');
try {
  const result2 = CreateUserSchema.parse({
    email: 'test@example.com',
    password: 'TestPass123!',
    name: 'Test User',
    role: 'USER',
  });
  console.log('✅ PASSED - Result role:', result2.role);
} catch (e) {
  console.log('❌ FAILED -', e.message);
}

console.log('\nTest 3: role = "" (empty string, should default to USER)');
try {
  const result3 = CreateUserSchema.parse({
    email: 'test@example.com',
    password: 'TestPass123!',
    name: 'Test User',
    role: '',
  });
  console.log('✅ PASSED - Result role:', result3.role);
} catch (e) {
  console.log('❌ FAILED -', e.message);
}

console.log('\nTest 4: role = undefined (should fail)');
try {
  const result4 = CreateUserSchema.parse({
    email: 'test@example.com',
    password: 'TestPass123!',
    name: 'Test User',
    // role is missing
  });
  console.log('✅ PASSED - Result role:', result4.role);
} catch (e) {
  console.log('❌ FAILED -', e.message);
}

console.log('\nTest 5: role = null (should fail)');
try {
  const result5 = CreateUserSchema.parse({
    email: 'test@example.com',
    password: 'TestPass123!',
    name: 'Test User',
    role: null,
  });
  console.log('✅ PASSED - Result role:', result5.role);
} catch (e) {
  console.log('❌ FAILED -', e.message);
}

console.log('\nDone!');
