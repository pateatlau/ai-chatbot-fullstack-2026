import { ValidationRule, GraphQLError } from 'graphql';
import {
  FieldNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  SelectionSetNode,
  visit,
} from 'graphql';

/**
 * Query Complexity Analysis
 * Calculates query complexity based on:
 * - Number of fields
 * - List multipliers (query for list with limit: 100 = 100x cost)
 * - Nested field depth
 */

interface ComplexityOptions {
  maximumComplexity: number;
  maximumDepth: number;
}

const DEFAULT_OPTIONS: ComplexityOptions = {
  maximumComplexity: 1000,
  maximumDepth: 5,
};

interface FieldWithCost {
  depth: number;
  multiplier: number;
}

/**
 * Estimate field cost based on naming conventions
 * - Fields ending with "s" are assumed to be lists
 * - Multiplier from limit argument is used
 */
function estimateFieldCost(
  fieldName: string,
  args: any[] = [],
  depth: number = 1
): number {
  let cost = 1;

  // Check for limit argument
  const limitArg = args.find((arg) => arg.name?.value === 'limit');
  if (limitArg && limitArg.value?.value) {
    const limit = Number(limitArg.value.value);
    cost *= Math.min(limit, 100); // Cap at 100 per field
  }

  // Pluralized fields are likely lists
  if (fieldName.endsWith('s') && !limitArg) {
    cost *= 10; // Assume list with default multiplier
  }

  // Add depth penalty
  cost += depth;

  return cost;
}

/**
 * Calculate query complexity recursively
 */
function calculateComplexity(
  selectionSet: SelectionSetNode | undefined,
  fragments: Map<string, FragmentDefinitionNode>,
  depth: number = 1,
  maxDepth: number = DEFAULT_OPTIONS.maximumDepth
): number {
  if (!selectionSet) {
    return 0;
  }

  if (depth > maxDepth) {
    console.warn(`[Complexity] Query exceeds maximum depth of ${maxDepth}`);
    return Infinity;
  }

  let complexity = 0;

  for (const selection of selectionSet.selections) {
    if (selection.kind === 'Field') {
      const field = selection as FieldNode;
      const fieldCost = estimateFieldCost(
        field.name.value,
        (field.arguments || []) as any,
        depth
      );

      const nestedComplexity = calculateComplexity(
        field.selectionSet,
        fragments,
        depth + 1,
        maxDepth
      );

      complexity += fieldCost + nestedComplexity;
    } else if (selection.kind === 'InlineFragment') {
      const nestedComplexity = calculateComplexity(
        selection.selectionSet,
        fragments,
        depth,
        maxDepth
      );
      complexity += nestedComplexity;
    } else if (selection.kind === 'FragmentSpread') {
      const fragment = fragments.get(selection.name.value);
      if (fragment) {
        const nestedComplexity = calculateComplexity(
          fragment.selectionSet,
          fragments,
          depth,
          maxDepth
        );
        complexity += nestedComplexity;
      }
    }
  }

  return complexity;
}

/**
 * GraphQL validation rule for complexity analysis
 */
export function createComplexityAnalysisRule(
  options: Partial<ComplexityOptions> = {}
): ValidationRule {
  const finalOptions = { ...DEFAULT_OPTIONS, ...options };

  return (context) => {
    const fragments: Map<string, FragmentDefinitionNode> = new Map();

    return {
      FragmentDefinition: (node) => {
        fragments.set(node.name.value, node);
        return false;
      },
      OperationDefinition: (node: OperationDefinitionNode) => {
        const complexity = calculateComplexity(
          node.selectionSet,
          fragments,
          1,
          finalOptions.maximumDepth
        );

        if (complexity === Infinity) {
          context.reportError(
            new GraphQLError(
              `Query depth exceeds maximum allowed depth of ${finalOptions.maximumDepth}`,
              { nodes: [node] }
            )
          );
        } else if (complexity > finalOptions.maximumComplexity) {
          context.reportError(
            new GraphQLError(
              `Query complexity of ${complexity} exceeds maximum allowed complexity of ${finalOptions.maximumComplexity}`,
              { nodes: [node] }
            )
          );
        } else {
          console.log(
            `[Complexity] Query accepted (complexity: ${complexity}/${finalOptions.maximumComplexity})`
          );
        }

        return false;
      },
    };
  };
}

/**
 * Create both depth limit and complexity analysis rules
 */
export function createComplexityAnalysisRules(
  options: Partial<ComplexityOptions> = {}
): ValidationRule[] {
  return [createComplexityAnalysisRule(options)];
}
