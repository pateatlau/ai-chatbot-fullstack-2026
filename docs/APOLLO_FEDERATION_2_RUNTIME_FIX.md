# Apollo Federation 2.0 Runtime Error - Fixed ✅

## Error Message

```
Failed to start server: Error: Unknown directive "@link".
Unknown directive "@link".
Unknown directive "@key".
```

This error occurs at runtime when Apollo Server tries to parse a GraphQL schema that contains Apollo Federation 2.0 directives but hasn't been properly built as a federated subgraph schema.

## Root Cause

The services were using a **standard Apollo Server schema initialization** instead of **Apollo Federation 2.0 subgraph initialization**.

### What Was Happening

```typescript
// ❌ WRONG - Standard schema initialization
const apolloServer = new ApolloServer({
  typeDefs, // Contains @link, @key directives
  resolvers,
});

// The standard GraphQL parser doesn't understand Federation directives
// Results in: "Unknown directive @link", "Unknown directive @key"
```

### Why This Fails

Apollo Federation 2.0 uses special directives:

- `@link` - Links to external specifications
- `@key` - Marks entities for federation
- `@external` - References external fields
- `extend schema` - Extends the supergraph

Standard GraphQL validators reject these directives because they don't understand them.

## Solution

Use **`buildSubgraphSchema`** from `@apollo/subgraph` instead:

```typescript
import { buildSubgraphSchema } from '@apollo/subgraph';

// ✅ CORRECT - Federation 2.0 subgraph schema
const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

const apolloServer = new ApolloServer({
  schema, // Pre-built subgraph schema
});
```

### What `buildSubgraphSchema` Does

1. ✅ Validates Federation 2.0 directives
2. ✅ Builds entity reference resolver stubs
3. ✅ Properly configures the schema for Apollo Gateway
4. ✅ Enables composition with other subgraphs

## Files Modified

```
apps/auth-service/src/main.ts
  - Added: import { buildSubgraphSchema } from '@apollo/subgraph'
  - Changed: typeDefs/resolvers → buildSubgraphSchema([{ typeDefs, resolvers }])

apps/chatbot-service/src/main.ts
  - Added: import { buildSubgraphSchema } from '@apollo/subgraph'
  - Changed: typeDefs/resolvers → buildSubgraphSchema([{ typeDefs, resolvers }])

apps/admin-service/src/main.ts
  - Added: import { buildSubgraphSchema } from '@apollo/subgraph'
  - Changed: typeDefs/resolvers → buildSubgraphSchema([{ typeDefs, resolvers }])
```

## Code Comparison

### Before ❌

```typescript
import { ApolloServer } from '@apollo/server';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

const startApolloServer = async () => {
  apolloServer = new ApolloServer({
    typeDefs, // Raw schema with @link, @key directives
    resolvers,
  });

  await apolloServer.start();
  return apolloServer;
};
```

**Result:** Runtime error - "Unknown directive @link"

### After ✅

```typescript
import { ApolloServer } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';

const startApolloServer = async () => {
  const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  apolloServer = new ApolloServer({
    schema, // Pre-processed subgraph schema
  });

  await apolloServer.start();
  return apolloServer;
};
```

**Result:** ✅ Server starts successfully

## When This Issue Occurs

This issue appears when:

1. ✅ Services have Apollo Federation 2.0 directives in schema
2. ✅ Services use standard Apollo Server initialization
3. ✅ Services attempt to start in development mode
4. ❌ Apollo Gateway tries to compose subgraphs

## Testing the Fix

```bash
# Build all services
nx build auth-service chatbot-service admin-service

# Start services
npm run dev

# Check server logs
# Should see: "Server running on http://localhost:3000/graphql"
# NO errors about "Unknown directive @link"
```

## Verification Checklist

- ✅ Auth Service starts without errors
- ✅ Chatbot Service starts without errors
- ✅ Admin Service starts without errors
- ✅ GraphQL endpoint responds at `/graphql`
- ✅ Apollo Gateway can compose subgraphs
- ✅ Federation directives properly handled

## Related Concepts

### Apollo Federation Basics

- **Federation 2.0**: Latest Apollo Federation specification
- **Subgraph**: A GraphQL service that participates in federation
- **Apollo Gateway**: Composes multiple subgraphs into single schema
- **Entity Resolution**: How gateway resolves cross-subgraph references

### TypeDefs with Federation

```graphql
# This requires buildSubgraphSchema
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0")

type User @key(fields: "id") {
  id: ID!
  email: String!
}

extend type Post @key(fields: "id") {
  id: ID! @external
  author: User!
}
```

## Prevention

When creating federated GraphQL services:

1. Always use `buildSubgraphSchema` for schema initialization
2. Include Federation directives in your schema
3. Test schema parsing before server start
4. Verify with Apollo Gateway in composition tests

## Git Commit

```
Commit: 37d6543
Message: fix(services): Use buildSubgraphSchema for Apollo Federation 2.0 in all subgraph services
Files Changed: 3 (auth, chatbot, admin service main.ts)
```

---

**Status**: ✅ Fixed
**Severity**: Critical (Service startup blocker)
**Impact**: Runtime, all subgraph services
**Applied to**: Auth, Chatbot, Admin services
