{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "targetDefaults": {
    "test": {
      "inputs": ["default", "^production", "{workspaceRoot}/jest.preset.js"]
    }
  }
}
