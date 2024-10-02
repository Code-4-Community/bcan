#!/usr/bin/env node

/**
 * Custom Build Scripts for BCAN Project
 *
 * This script performs the following:
 * 1. Scans specified directories for TypeScript files.
 * 2. Parses import/export statements to build a module dependency graph.
 * 3. Detects circular dependencies in the graph.
 * 4. Identifies unused variables across modules.
 * 5. Provides text-based visualizations of dependencies.
 *
 * Usage:
 *   node customBuildScripts.js [dir1] [dir2] ... [dirN]
 *   If no directories are specified, defaults to 'backend/src' and 'frontend/src'.
 */

const path = require('path');
const ts = require('typescript');
const { Project } = require('ts-morph');

// Default Directories to analyze
const DEFAULT_DIRECTORIES = ['backend/src', 'frontend/src'];

// Data structures
let moduleDependencies = {}; // { modulePath: [dependencyModulePath, ...] }
let exportsMap = {}; // { modulePath: Set of exported variables }
let declarationsMap = {}; // { modulePath: Set of declarations }
let usageMap = {}; // { modulePath: Set of used variables }

// Initialize ts-morph Project
const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: true,
});

/**
 * Recursively walk through a directory and add all .ts files to the project
 * @param {string} dir - Directory path
 */
function addSourceFiles(dir) {
  const absoluteDir = path.resolve(dir);
  const globPattern = path.join(absoluteDir, '**/*.ts');
  project.addSourceFilesAtPaths(globPattern);
}

/**
 * Build the dependency graph by analyzing import/export statements
 */
function buildDependencyGraph() {
  const sourceFiles = project.getSourceFiles();

  sourceFiles.forEach((sourceFile) => {
    const modulePath = path.relative(process.cwd(), sourceFile.getFilePath());
    moduleDependencies[modulePath] = [];

    // Handle imports
    sourceFile.getImportDeclarations().forEach((importDec) => {
      const importPath = importDec.getModuleSpecifierValue();
      if (importPath.startsWith('.')) {
        const importedSourceFile = importDec.getModuleSpecifierSourceFile();
        if (importedSourceFile) {
          const importedModulePath = path.relative(process.cwd(), importedSourceFile.getFilePath());
          moduleDependencies[modulePath].push(importedModulePath);
        }
      }
    });

    // Handle exports
    const exportedDeclarations = sourceFile.getExportedDeclarations();
    exportsMap[modulePath] = new Set();
    exportedDeclarations.forEach((decls, name) => {
      exportsMap[modulePath].add(name);
    });
  });
}

/**
 * Detect circular dependencies in the module dependency graph
 * @returns {Array} - Array of cycles found (each cycle is an array of module paths)
 */
function detectCircularDependencies() {
  const visited = new Set();
  const recStack = new Set();
  const cycles = [];

  function dfs(node, path) {
    if (!visited.has(node)) {
      visited.add(node);
      recStack.add(node);
      path.push(node);

      const neighbors = moduleDependencies[node] || [];
      for (let neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, path);
        } else if (recStack.has(neighbor)) {
          const cycleStartIndex = path.indexOf(neighbor);
          const cycle = path.slice(cycleStartIndex);
          // Avoid recording duplicate cycles
          if (
            !cycles.some(
              (existingCycle) =>
                existingCycle.length === cycle.length &&
                existingCycle.every((mod, idx) => mod === cycle[idx])
            )
          ) {
            cycles.push([...cycle, neighbor]);
          }
        }
      }
    }
    recStack.delete(node);
    path.pop();
  }

  Object.keys(moduleDependencies).forEach((node) => {
    dfs(node, []);
  });

  return cycles;
}

/**
 * Identify unused variables across all modules manually by traversing the AST
 * @returns {Array} - Array of objects { module: string, variable: string }
 */
function identifyUnusedVariables() {
  const unusedVariables = [];

  // First pass: Collect all declarations
  project.getSourceFiles().forEach((sourceFile) => {
    const modulePath = path.relative(process.cwd(), sourceFile.getFilePath());
    declarationsMap[modulePath] = new Set();

    // Handle Variable Declarations
    sourceFile.getVariableDeclarations().forEach((varDec) => {
      const varName = varDec.getName();
      declarationsMap[modulePath].add(varName);
    });

    // Handle Function Declarations
    sourceFile.getFunctions().forEach((funcDec) => {
      const funcName = funcDec.getName();
      if (funcName) {
        declarationsMap[modulePath].add(funcName);
      }
    });

    // Handle Class Declarations
    sourceFile.getClasses().forEach((classDec) => {
      const className = classDec.getName();
      if (className) {
        declarationsMap[modulePath].add(className);
      }
    });

    // Add additional handlers for interfaces, type aliases, etc., if necessary
  });

  // Initialize usageMap
  project.getSourceFiles().forEach((sourceFile) => {
    const modulePath = path.relative(process.cwd(), sourceFile.getFilePath());
    usageMap[modulePath] = new Set();
  });

  // Second pass: Collect all usages
  project.getSourceFiles().forEach((sourceFile) => {
    const modulePath = path.relative(process.cwd(), sourceFile.getFilePath());

    // Traverse all descendant nodes to find Identifier usages
    sourceFile.forEachDescendant((node) => {
      if (ts.isIdentifier(node.compilerNode)) {
        const identifier = node;
        const varName = identifier.getText();

        // Skip if it's a declaration
        const parent = identifier.getParent();
        if (
          ts.isVariableDeclaration(parent.compilerNode) ||
          ts.isFunctionDeclaration(parent.compilerNode) ||
          ts.isParameter(parent.compilerNode) ||
          ts.isPropertyDeclaration(parent.compilerNode) ||
          ts.isClassDeclaration(parent.compilerNode) ||
          ts.isInterfaceDeclaration(parent.compilerNode) ||
          ts.isTypeAliasDeclaration(parent.compilerNode)
        ) {
          return;
        }

        // Attempt to resolve the symbol
        const symbol = identifier.getSymbol();
        if (!symbol) {
          return;
        }

        // Get the declaration source file
        const declarations = symbol.getDeclarations();
        if (!declarations || declarations.length === 0) {
          return;
        }

        const declaringSourceFile = declarations[0].getSourceFile();
        const declaringModulePath = path.relative(process.cwd(), declaringSourceFile.getFilePath());

        // Avoid self-usage detection for exported variables
        if (declaringModulePath === modulePath) {
          usageMap[modulePath].add(varName);
        } else {
          // Mark as used in declaring module
          usageMap[declaringModulePath] = usageMap[declaringModulePath] || new Set();
          usageMap[declaringModulePath].add(varName);
        }
      }
    });
  });

  // Third pass: Determine unused variables
  Object.keys(declarationsMap).forEach((module) => {
    declarationsMap[module].forEach((varName) => {
      const isExported = exportsMap[module] && exportsMap[module].has(varName);
      const isUsedInModule = usageMap[module] && usageMap[module].has(varName);

      if (!isExported && !isUsedInModule) {
        // Variable is not exported and not used in its own module
        unusedVariables.push({ module, variable: varName });
      } else if (isExported) {
        // If exported, check if it's used in other modules
        let isUsedExternally = false;
        Object.keys(usageMap).forEach((otherModule) => {
          if (otherModule !== module && usageMap[otherModule].has(varName)) {
            isUsedExternally = true;
          }
        });

        if (!isUsedInModule && !isUsedExternally) {
          // Variable is exported but not used in its own module and not used externally
          unusedVariables.push({ module, variable: varName });
        }
      }
    });
  });

  return unusedVariables;
}

/**
 * Provide a text-based visualization of the dependency graph
 */
function visualizeDependencies() {
  console.log('\n--- Module Dependency Tree ---\n');

  // Find root modules (modules that are not dependencies of any other modules)
  const allModules = new Set(Object.keys(moduleDependencies));
  Object.values(moduleDependencies).forEach((deps) => {
    deps.forEach((dep) => allModules.delete(dep));
  });

  if (allModules.size === 0) {
    console.log('No root modules found. All modules are interconnected.');
    return;
  }

  allModules.forEach((root) => {
    printDependencyTree(root, 0, new Set());
  });

  console.log('--- End of Dependency Tree ---\n');
}

/**
 * Recursively print the dependency tree for a module
 * @param {string} modulePath - Absolute module path
 * @param {number} level - Current indentation level
 * @param {Set} visited - Set of already visited modules to avoid infinite loops
 */
function printDependencyTree(modulePath, level, visited) {
  const indent = '  '.repeat(level);
  const moduleName = path.basename(modulePath);
  console.log(`${indent}- ${moduleName}`);

  if (visited.has(modulePath)) {
    console.log(`${indent}  (Already Visited)`);
    return;
  }

  visited.add(modulePath);

  const dependencies = moduleDependencies[modulePath] || [];
  dependencies.forEach((dep) => {
    printDependencyTree(dep, level + 1, visited);
  });
}

/**
 * Main function to run all checks
 * @param {Array} directories - Directories to analyze
 */
function runChecks(directories = DEFAULT_DIRECTORIES) {
  console.log('Starting Custom Build Scripts...\n');

  directories.forEach((dir) => {
    addSourceFiles(dir);
  });

  console.log('Analyzing the following directories:');
  directories.forEach((dir) => {
    console.log(`- ${path.resolve(dir)}`);
  });

  console.log('\nTotal TypeScript files found:', project.getSourceFiles().length);

  buildDependencyGraph();

  // Detect circular dependencies
  const cycles = detectCircularDependencies();
  if (cycles.length > 0) {
    console.error('\n🔴 Circular Dependencies Detected:');
    cycles.forEach((cycle, index) => {
      const cycleModules = cycle.map((mod) => path.basename(mod));
      console.error(`  ${index + 1}. ${cycleModules.join(' -> ')}`);
    });
  } else {
    console.log('\n✅ No Circular Dependencies Detected.');
  }

  // Identify unused variables
  const unusedVars = identifyUnusedVariables();
  if (unusedVars.length > 0) {
    console.warn('\n⚠️ Unused Variables Found:');
    unusedVars.forEach((item, index) => {
      console.warn(`  ${index + 1}. ${path.basename(item.module)}: ${item.variable}`);
    });
  } else {
    console.log('\n✅ No Unused Variables Detected.');
  }

  visualizeDependencies();

  if (cycles.length > 0 || unusedVars.length > 0) {
    console.error('\nBuild Failed: Please resolve the above issues before proceeding.');
    process.exit(1);
  } else {
    console.log('All checks passed successfully.');
    process.exit(0);
  }
}

module.exports = {
  runChecks,
};

if (require.main === module) {
  const directories = process.argv.slice(2);
  runChecks(directories.length > 0 ? directories : undefined);
}