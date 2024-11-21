#!/usr/bin/env node

/**
 * BCAN Doctor Script
 *
 * This script performs the following:
 * - Scans specified directories for TypeScript files.
 * - Parses modules, classes, and functions to build an architecture tree.
 * - Generates a Mermaid diagram visualizing the backend architecture.
 *
 * Usage:
 *   node bcan-doctor.js [options] [dir1] [dir2] ... [dirN]
 *
 * Options:
 *   --output [file]    Specify output file name (default: architecture.md).
 *   --help             Display help information.
 *
 * If no directories are specified, 'backend/src' is used by default.
 */

const path = require('path');
const fs = require('fs');
const { Project, SyntaxKind } = require('ts-morph');

const DEFAULT_DIRECTORIES = ['backend/src'];

let architectureTree = {};
let nodeIdCounter = 0;

/**
 * Recursively walk through directories and build the architecture tree.
 * @param {Array} directories - Array of directory paths.
 */
function buildArchitectureTree(directories) {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
    skipAddingFilesFromTsConfig: true,
  });

  directories.forEach((dir) => {
    const absoluteDir = path.resolve(dir);
    const globPattern = path.join(absoluteDir, '**/*.{ts,tsx}');
    project.addSourceFilesAtPaths(globPattern);
  });

  const sourceFiles = project.getSourceFiles();
  architectureTree = { name: 'root', subdirectories: {}, files: {} };

  sourceFiles.forEach((sourceFile) => {
    const filePath = path.relative(process.cwd(), sourceFile.getFilePath());
    const pathParts = filePath.split(path.sep);
    const fileName = pathParts.pop();
    let currentDir = architectureTree;

    // Build the directory tree
    pathParts.forEach((dirName) => {
      if (!currentDir.subdirectories[dirName]) {
        currentDir.subdirectories[dirName] = { name: dirName, subdirectories: {}, files: {} };
      }
      currentDir = currentDir.subdirectories[dirName];
    });

    // Extract functions and methods
    const functions = [];

    sourceFile.forEachChild((child) => {
      if (child.getKind() === SyntaxKind.FunctionDeclaration) {
        const funcDecl = child.asKind(SyntaxKind.FunctionDeclaration);
        const name = funcDecl.getName();
        if (name) {
          functions.push(name);
        }
      } else if (child.getKind() === SyntaxKind.ClassDeclaration) {
        const classDecl = child.asKind(SyntaxKind.ClassDeclaration);
        const className = classDecl.getName();
        if (className) {
          classDecl.getMethods().forEach((method) => {
            const methodName = method.getName();
            functions.push(`${className}.${methodName}`);
          });
        }
      }
    });

    // Add file and functions to the current directory
    currentDir.files[fileName] = functions;
  });
}

/**
 * Generate Mermaid diagram from the architecture tree.
 * @returns {string} - Mermaid diagram as a string.
 */
function generateMermaidDiagram() {
  let mermaid = 'graph TD\n';

  function traverse(node, parentId) {
    const currentId = `node${nodeIdCounter++}`;
    mermaid += `  ${currentId}["${node.name}"]\n`;
    if (parentId) {
      mermaid += `  ${parentId} --> ${currentId}\n`;
    }

    for (const subDirName in node.subdirectories) {
      traverse(node.subdirectories[subDirName], currentId);
    }

    for (const fileName in node.files) {
      const fileId = `node${nodeIdCounter++}`;
      mermaid += `  ${fileId}["${fileName}"]\n`;
      mermaid += `  ${currentId} --> ${fileId}\n`;
      const functions = node.files[fileName];
      functions.forEach((func) => {
        const funcId = `node${nodeIdCounter++}`;
        mermaid += `  ${funcId}["${func}"]\n`;
        mermaid += `  ${fileId} --> ${funcId}\n`;
      });
    }
  }

  traverse(architectureTree, null);
  return mermaid;
}

/**
 * Display help information.
 */
function displayHelp() {
  console.log(`
BCAN Doctor Script

Usage:
  node bcan-doctor.js [options] [dir1] [dir2] ... [dirN]

Options:
  --output [file]    Specify output file name (default: architecture.md).
  --help             Display this help information.

If no directories are specified, 'backend/src' is used by default.
  `);
}

/**
 * Parse command-line arguments.
 * @returns {Object} - Parsed arguments and flags.
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const flags = {
    directories: [],
    output: 'architecture.md',
    help: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    switch (arg) {
      case '--output':
        i++;
        flags.output = args[i] || 'architecture.md';
        break;
      case '--help':
        flags.help = true;
        break;
      default:
        if (!arg.startsWith('--')) {
          flags.directories.push(arg);
        }
        break;
    }
    i++;
  }

  return flags;
}

/**
 * Main function to generate documentation.
 * @param {Array} directories - Directories to analyze.
 * @param {string} outputFile - Output file name.
 */
function generateDocumentation(directories = DEFAULT_DIRECTORIES, outputFile) {
  console.log('Starting BCAN Doctor...\n');

  console.log('Analyzing the following directories:');
  directories.forEach((dir) => {
    console.log(`- ${path.resolve(dir)}`);
  });

  buildArchitectureTree(directories);

  const mermaidDiagram = generateMermaidDiagram();
  fs.writeFileSync(outputFile, '```mermaid\n' + mermaidDiagram + '\n```');
  console.log(`\n✅ Backend architecture documentation generated in ${outputFile}`);
}

if (require.main === module) {
  const flags = parseArguments();

  if (flags.help) {
    displayHelp();
    process.exit(0);
  }

  const directories = flags.directories.length > 0 ? flags.directories : DEFAULT_DIRECTORIES;
  generateDocumentation(directories, flags.output);
}
