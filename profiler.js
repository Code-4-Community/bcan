#!/usr/bin/env node

/**
 * Profiler Tool for BCAN Project
 *
 * This script walks through the backend/ and frontend/ directories,
 * parses TypeScript files to extract module dependencies,
 * detects circular dependencies, and generates Graphviz DOT files
 * representing the architecture, routes, and SatchelJS store behavior.
 *
 * Usage:
 *   node profiler.js
 *
 * Output:
 *   architecture.dot
 *   routes.dot
 *   satchel_store.dot
 *
 * Note:
 *   Ensure that Graphviz is installed to visualize the DOT files.
 */

const fs = require('fs');
const path = require('path');

// Directories to analyze
const DIRECTORIES = ['backend', 'frontend'];

// Data structures to hold parsed information
const moduleDependencies = {}; // { modulePath: [dependencyModulePath, ...] }
const routes = []; // [ { method: 'GET', path: '/auth/login', controller: 'AuthController', action: 'login' }, ... ]
const storeActions = {}; // { actionName: { file: 'path', usages: [] } }

// Helper function to resolve import paths to absolute file paths
function resolveImportPath(currentFile, importPath) {
  // Handle relative imports
  if (importPath.startsWith('.')) {
    let resolvedPath = path.resolve(path.dirname(currentFile), importPath);
    if (!resolvedPath.endsWith('.ts')) {
      resolvedPath += '.ts';
    }
    if (fs.existsSync(resolvedPath)) {
      return path.relative(process.cwd(), resolvedPath);
    } else {
      // Handle index.ts
      resolvedPath = path.resolve(path.dirname(currentFile), importPath, 'index.ts');
      if (fs.existsSync(resolvedPath)) {
        return path.relative(process.cwd(), resolvedPath);
      }
    }
  }
  // For simplicity, ignore non-relative imports (e.g., node_modules)
  return null;
}

/**
 * Recursively walk through a directory and return all .ts files
 * @param {string} dir - Directory path
 * @returns {string[]} - Array of file paths relative to the project root
 */
function getAllTypeScriptFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTypeScriptFiles(filePath));
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      results.push(path.relative(process.cwd(), filePath));
    }
  });
  return results;
}

/**
 * Parse a TypeScript file to extract module dependencies and routes
 * @param {string} filePath - Relative path to the .ts file
 */
function parseTypeScriptFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    line = line.trim();

    // Detect import statements
    const importMatch = line.match(/^import\s+.*\s+from\s+['"](.+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      const resolvedImport = resolveImportPath(filePath, importPath);
      if (resolvedImport) {
        if (!moduleDependencies[filePath]) {
          moduleDependencies[filePath] = [];
        }
        moduleDependencies[filePath].push(resolvedImport);
      }
    }

    // Detect route decorators and actions
    // Assuming decorators are on the line before the method declaration
    const decoratorMatch = lines[index - 1]?.trim().match(/@(Get|Post|Put|Delete|Patch)\(['"`](.+)['"`]\)/);
    if (decoratorMatch) {
      const httpMethod = decoratorMatch[1].toUpperCase();
      const routePath = decoratorMatch[2];
      // Extract controller and action from current method
      const methodMatch = line.match(/^(public|private|protected)?\s*(async\s+)?(\w+)\s*\(/);
      if (methodMatch) {
        const controllerMatch = filePath.match(/([^/\\]+)Controller\.ts$/);
        if (controllerMatch) {
          const controllerName = controllerMatch[1] + 'Controller';
          const actionName = methodMatch[3];
          routes.push({
            method: httpMethod,
            path: routePath,
            controller: controllerName,
            action: actionName
          });
        }
      }
    }

    // Detect action definitions in frontend
    const actionDefMatch = line.match(/export\s+const\s+(\w+)\s*=\s*action\(/);
    if (actionDefMatch) {
      const actionName = actionDefMatch[1];
      storeActions[actionName] = {
        file: path.relative(process.cwd(), filePath),
        usages: []
      };
    }

    // Detect action usages in frontend files
    if (filePath.startsWith('frontend')) {
      Object.keys(storeActions).forEach(actionName => {
        if (line.includes(actionName)) {
          storeActions[actionName].usages.push(filePath);
        }
      });
    }
  });
}

/**
 * Detect circular dependencies using Depth-First Search
 * @param {Object} graph - Dependency graph { modulePath: [dependencyModulePath, ...] }
 * @returns {Array} - Array of cycles found (each cycle is an array of module paths)
 */
function detectCircularDependencies(graph) {
  const visited = {};
  const recStack = {};
  const cycles = [];

  function dfs(node, path) {
    if (!visited[node]) {
      visited[node] = true;
      recStack[node] = true;
      path.push(node);

      const neighbors = graph[node] || [];
      for (let neighbor of neighbors) {
        if (!visited[neighbor] && dfs(neighbor, path)) {
          return true;
        } else if (recStack[neighbor]) {
          // Found a cycle
          const cycleStartIndex = path.indexOf(neighbor);
          const cycle = path.slice(cycleStartIndex);
          cycles.push([...cycle, neighbor]);
        }
      }
    }
    recStack[node] = false;
    path.pop();
    return false;
  }

  Object.keys(graph).forEach(node => {
    if (!visited[node]) {
      dfs(node, []);
    }
  });

  return cycles;
}

/**
 * Generate a Graphviz DOT file from the parsed data
 * @param {string} outputPath - Path to the output DOT file
 * @param {string} title - Title of the graph
 * @param {Function} nodeGenerator - Function to generate node definitions
 * @param {Function} edgeGenerator - Function to generate edge definitions
 */
function generateDotFile(outputPath, title, nodeGenerator, edgeGenerator) {
  let dot = `digraph ${title} {\n`;
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=rectangle, style=filled, color=lightblue];\n\n';

  // Define nodes
  nodeGenerator();

  dot += '\n';

  // Define edges
  edgeGenerator();

  dot += '}\n';

  fs.writeFileSync(outputPath, dot, 'utf8');
  console.log(`Profiler generated ${outputPath}`);
}

/**
 * Generate Architecture DOT
 */
function generateArchitectureDot() {
  generateDotFile(
    'architecture.dot',
    'BCANArchitecture',
    () => {
      Object.keys(moduleDependencies).forEach(modulePath => {
        const moduleName = path.basename(modulePath);
        const nodeLine = `  "${moduleName}" [label="${moduleName}"];\n`;
        fs.appendFileSync('architecture.dot', nodeLine);
      });
    },
    () => {
      Object.entries(moduleDependencies).forEach(([modulePath, deps]) => {
        const fromModule = path.basename(modulePath);
        deps.forEach(dep => {
          const toModule = path.basename(dep);
          const edgeLine = `  "${fromModule}" -> "${toModule}";\n`;
          fs.appendFileSync('architecture.dot', edgeLine);
        });
      });
    }
  );
}

/**
 * Generate Routes DOT
 */
function generateRoutesDot() {
  generateDotFile(
    'routes.dot',
    'Routes',
    () => {
      // Nodes for controllers
      const controllers = new Set(routes.map(r => r.controller));
      controllers.forEach(controller => {
        const nodeLine = `  "${controller}" [label="${controller}"];\n`;
        fs.appendFileSync('routes.dot', nodeLine);
      });

      // Nodes for routes
      routes.forEach(route => {
        const routeNode = `"${route.method} ${route.path}"`;
        const nodeLine = `  ${routeNode} [shape=ellipse, style=filled, color=lightgreen, label="${route.method} ${route.path}"];\n`;
        fs.appendFileSync('routes.dot', nodeLine);
      });
    },
    () => {
      // Define edges from controllers to routes
      routes.forEach(route => {
        const fromModule = route.controller;
        const toModule = `"${route.method} ${route.path}"`;
        const edgeLine = `  "${fromModule}" -> ${toModule} [label="${route.method}"];\n`;
        fs.appendFileSync('routes.dot', edgeLine);
      });
    }
  );
}

/**
 * Generate SatchelJS Store DOT
 */
function generateSatchelStoreDot() {
  generateDotFile(
    'satchel_store.dot',
    'SatchelJSStore',
    () => {
      // Define action nodes
      Object.keys(storeActions).forEach(actionName => {
        const action = storeActions[actionName];
        const nodeLine = `  "${actionName}" [shape=diamond, style=filled, color=orange, label="${actionName}\\n(${path.basename(action.file)})"];\n`;
        fs.appendFileSync('satchel_store.dot', nodeLine);
      });

      // Define usage nodes
      const usageSet = new Set();
      Object.keys(storeActions).forEach(actionName => {
        storeActions[actionName].usages.forEach(usageFile => {
          if (!usageSet.has(usageFile)) {
            usageSet.add(usageFile);
            const usageNode = path.basename(usageFile);
            const nodeLine = `  "${usageNode}" [shape=box, style=filled, color=lightyellow, label="${usageNode}"];\n`;
            fs.appendFileSync('satchel_store.dot', nodeLine);
          }
        });
      });
    },
    () => {
      // Define edges from usages to actions
      Object.keys(storeActions).forEach(actionName => {
        storeActions[actionName].usages.forEach(usageFile => {
          const usageNode = path.basename(usageFile);
          const edgeLine = `  "${usageNode}" -> "${actionName}";\n`;
          fs.appendFileSync('satchel_store.dot', edgeLine);
        });
      });
    }
  );
}

/**
 * Detect and Report Circular Dependencies
 */
function reportCircularDependencies() {
  const cycles = detectCircularDependencies(moduleDependencies);
  if (cycles.length > 0) {
    console.warn('Circular Dependencies Detected:');
    cycles.forEach((cycle, index) => {
      console.warn(`  Cycle ${index + 1}: ${cycle.join(' -> ')}`);
    });
    // Exit with error code to prevent merging
    process.exitCode = 1;
  } else {
    console.log('No Circular Dependencies Detected.');
  }
}

/**
 * Main Execution
 */
function main() {
  console.log('Starting BCAN Profiler...');

  // Clear existing DOT files
  ['architecture.dot', 'routes.dot', 'satchel_store.dot'].forEach(file => {
    fs.writeFileSync(file, '', 'utf8');
  });

  // Parse all TypeScript files
  DIRECTORIES.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.warn(`Directory ${dir} does not exist. Skipping...`);
      return;
    }

    const tsFiles = getAllTypeScriptFiles(fullPath);
    tsFiles.forEach(file => parseTypeScriptFile(file));
  });

  // Generate DOT files
  generateArchitectureDot();
  generateRoutesDot();
  generateSatchelStoreDot();

  // Detect Circular Dependencies
  reportCircularDependencies();

  console.log('Profiler completed.');
}

main();