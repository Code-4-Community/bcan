#!/usr/bin/env node

/**
 * Custom Sanitize Scripts for BCAN Project
 *
 * This script performs the following:
 * 1. Scans specified directories for TypeScript files.
 * 2. Parses import/export statements to build a module dependency graph.
 * 3. Identifies circular dependencies.
 * 4. Identifies unused variables.
 *
 * Usage:
 *   node canIMerge.js [options] [dir1] [dir2] ... [dirN]
 *
 * Options:
 *   --check-circular       Perform circular dependency checks.
 *   --check-unused-vars    Perform unused variables checks.
 *   --help                 Display help information.
 *
 * If no options are specified, all checks are performed.
 */

const path = require('path');
const ts = require('typescript');
const { Project } = require('ts-morph');

const DEFAULT_DIRECTORIES = ['backend/src', 'frontend/src'];

let moduleDependencies = {}; // { modulePath: [dependencyModulePath, ...] }
let exportsMap = {}; // { modulePath: Set of exported variables }
let declarationsMap = {}; // { modulePath: Set of declarations }
let usageMap = {}; // { modulePath: Set of used variables }

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
  skipAddingFilesFromTsConfig: true,
});

/**
 * Recursively walk through a directory and add all .ts/.tsx files to the project
 * @param {string} dir - Directory path
 */
function addSourceFiles(dir) {
  const absoluteDir = path.resolve(dir);
  const globPattern = path.join(absoluteDir, '**/*.{ts,tsx}');
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

function identifyUnusedVariables() {
  const unusedVariables = [];

  const declarations = [];

  project.getSourceFiles().forEach((sourceFile) => {
    const modulePath = path.relative(process.cwd(), sourceFile.getFilePath());

    sourceFile.forEachDescendant((node) => {
      if (ts.isVariableDeclaration(node.compilerNode) ||
          ts.isFunctionDeclaration(node.compilerNode) ||
          ts.isClassDeclaration(node.compilerNode) ||
          ts.isInterfaceDeclaration(node.compilerNode) ||
          ts.isTypeAliasDeclaration(node.compilerNode)) {
        
        const varName = node.getName ? node.getName() : null;
        if (varName) {
          const symbol = node.getSymbol();
          if (symbol) {
            declarations.push({
              name: varName,
              symbol: symbol,
              module: modulePath,
            });
          }
        }
      }
    });
  });

  const usageMapLocal = new Map();

  project.getSourceFiles().forEach((sourceFile) => {
    sourceFile.forEachDescendant((node) => {
      if (ts.isIdentifier(node.compilerNode)) {
        const identifier = node;
        const varName = identifier.getText();

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

        const symbol = identifier.getSymbol();
        if (!symbol) return;

        const declarations = symbol.getDeclarations();
        if (!declarations || declarations.length === 0) return;

        const declaringSourceFile = declarations[0].getSourceFile();
        const declaringModulePath = path.relative(process.cwd(), declaringSourceFile.getFilePath());

        const key = `${declaringModulePath}:${symbol.getName()}`;
        usageMapLocal.set(key, true);
      }
    });
  });

  declarations.forEach(({ name, symbol, module }) => {
    const key = `${module}:${name}`;
    if (!usageMapLocal.has(key)) {
      unusedVariables.push({ module, variable: name });
    }
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
 * Parse command-line arguments to determine which checks to run
 * @returns {Object} - Object containing flags for each check
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const flags = {
    checkCircular: false,
    checkUnusedVars: false,
    help: false,
  };

  args.forEach(arg => {
    switch(arg) {
      case '--check-circular':
        flags.checkCircular = true;
        break;
      case '--check-unused-vars':
        flags.checkUnusedVars = true;
        break;
      case '--help':
        flags.help = true;
        break;
      default:
        // You can handle directory arguments here if needed
        break;
    }
  });

  return flags;
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(`
Custom Sanitize Scripts for BCAN Project

Usage:
  node canIMerge.js [options] [dir1] [dir2] ... [dirN]

Options:
  --check-circular       Perform circular dependency checks.
  --check-unused-vars    Perform unused variables checks.
  --help                 Display this help information.

If no options are specified, all checks are performed.
  `);
}

/**
 * Main function to run specified checks
 * @param {Array} directories - Directories to analyze
 * @param {Object} flags - Flags indicating which checks to run
 */
function runChecks(directories = DEFAULT_DIRECTORIES, flags) {
  console.log('Starting Profiler...\n');

  directories.forEach((dir) => {
    addSourceFiles(dir);
  });

  console.log('Analyzing the following directories:');
  directories.forEach((dir) => {
    console.log(`- ${path.resolve(dir)}`);
  });

  console.log('\nTotal TypeScript files found:', project.getSourceFiles().length);

  if (flags.checkCircular || (!flags.checkCircular && !flags.checkUnusedVars)) {
    buildDependencyGraph();

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

    if (cycles.length > 0) {
      console.error('\nBuild Failed: Please resolve the above circular dependencies before proceeding.');
      process.exit(1);
    }
  }

  if (flags.checkUnusedVars || (!flags.checkCircular && !flags.checkUnusedVars)) {
    const unusedVars = identifyUnusedVariables();
    if (unusedVars.length > 0) {
      console.warn('\n⚠️ Unused Variables Found:');
      unusedVars.forEach((item, index) => {
        console.warn(`  ${index + 1}. ${path.basename(item.module)}: ${item.variable}`);
      });
    } else {
      console.log('\n✅ No Unused Variables Detected.');
    }

    if (flags.checkUnusedVars && unusedVars.length > 0) {
      console.error('\nBuild Failed: Please resolve the above unused variables before proceeding.');
      process.exit(1);
    }
  }

  visualizeDependencies();

  console.log('All requested checks passed successfully.');
  process.exit(0);
}

module.exports = {
  runChecks,
};

if (require.main === module) {
  const flags = parseArguments();

  if (flags.help) {
    displayHelp();
    process.exit(0);
  }

  const directories = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  runChecks(directories.length > 0 ? directories : undefined, flags);
}