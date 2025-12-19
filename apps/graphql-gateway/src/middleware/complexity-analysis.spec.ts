import { createComplexityAnalysisRule } from './complexity-analysis';
import { parse, validate, buildSchema } from 'graphql';

describe('Complexity Analysis Middleware', () => {
  const schema = buildSchema(`
    type Query {
      user(id: ID!): User
      users(limit: Int): [User!]!
      conversation(id: ID!): Conversation
      conversations(limit: Int): [Conversation!]!
    }

    type User {
      id: ID!
      name: String!
      email: String!
      conversations(limit: Int): [Conversation!]!
    }

    type Conversation {
      id: ID!
      title: String!
      messages(limit: Int): [Message!]!
    }

    type Message {
      id: ID!
      content: String!
      createdAt: String!
    }
  `);

  describe('Simple queries', () => {
    it('should accept simple user query', () => {
      const query = `
        query {
          user(id: "123") {
            id
            name
          }
        }
      `;

      const ast = parse(query);
      const rule = createComplexityAnalysisRule({ maximumComplexity: 1000 });
      const errors = validate(schema, ast, [rule]);

      expect(errors).toHaveLength(0);
    });

    it('should accept query with reasonable depth', () => {
      const query = `
        query {
          users(limit: 10) {
            id
            name
            conversations(limit: 5) {
              id
              title
            }
          }
        }
      `;

      const ast = parse(query);
      const rule = createComplexityAnalysisRule({ maximumComplexity: 1000 });
      const errors = validate(schema, ast, [rule]);

      expect(errors).toHaveLength(0);
    });
  });

  describe('Overly complex queries', () => {
    it('should reject query exceeding complexity limit', () => {
      const query = `
        query {
          users(limit: 1000) {
            id
            conversations(limit: 100) {
              id
              messages(limit: 100) {
                id
                content
              }
            }
          }
        }
      `;

      const ast = parse(query);
      const rule = createComplexityAnalysisRule({ maximumComplexity: 100 });
      const errors = validate(schema, ast, [rule]);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('exceeds maximum');
    });
  });

  describe('Depth limiting', () => {
    it('should reject queries exceeding maximum depth', () => {
      const query = `
        query {
          users {
            conversations {
              messages {
                content
              }
            }
          }
        }
      `;

      const ast = parse(query);
      const rule = createComplexityAnalysisRule({
        maximumComplexity: 10000,
        maximumDepth: 2,
      });
      const errors = validate(schema, ast, [rule]);

      // Should have errors due to exceeding depth
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept queries within depth limit', () => {
      const query = `
        query {
          users {
            conversations {
              id
            }
          }
        }
      `;

      const ast = parse(query);
      const rule = createComplexityAnalysisRule({
        maximumComplexity: 1000,
        maximumDepth: 3,
      });
      const errors = validate(schema, ast, [rule]);

      expect(errors).toHaveLength(0);
    });
  });

  describe('Configuration options', () => {
    it('should respect custom maximum complexity', () => {
      const query = `
        query {
          users(limit: 200) {
            id
          }
        }
      `;

      const ast = parse(query);

      // With high limit, should pass
      const rule1 = createComplexityAnalysisRule({ maximumComplexity: 5000 });
      let errors = validate(schema, ast, [rule1]);
      expect(errors).toHaveLength(0);

      // With low limit, should fail
      const rule2 = createComplexityAnalysisRule({ maximumComplexity: 50 });
      errors = validate(schema, ast, [rule2]);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should use default values when not specified', () => {
      const query = `
        query {
          users(limit: 10) {
            id
          }
        }
      `;

      const ast = parse(query);
      const rule = createComplexityAnalysisRule();
      const errors = validate(schema, ast, [rule]);

      // Should pass with default config
      expect(errors).toHaveLength(0);
    });
  });

  describe('Error messages', () => {
    it('should include helpful error message for complexity violation', () => {
      const query = `
        query {
          users(limit: 2000) {
            id
          }
        }
      `;

      const ast = parse(query);
      const rule = createComplexityAnalysisRule({ maximumComplexity: 100 });
      const errors = validate(schema, ast, [rule]);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('complexity');
    });

    it('should include helpful error message for depth violation', () => {
      const query = `
        query {
          users {
            conversations {
              messages {
                content
              }
            }
          }
        }
      `;

      const ast = parse(query);
      const rule = createComplexityAnalysisRule({
        maximumComplexity: 10000,
        maximumDepth: 2,
      });
      const errors = validate(schema, ast, [rule]);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('depth');
    });
  });
});
