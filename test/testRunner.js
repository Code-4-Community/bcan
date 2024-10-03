#!/usr/bin/env node

/**
 * Test Runner for Custom Build Scripts
 *
 * This script runs the customBuildScripts.js against the test/ directory
 * to verify that circular dependencies and unused variables are correctly detected.
 */

const path = require('path');
const { spawn } = require('child_process');

const TEST_DIRECTORIES = [
  path.join('test', 'backend', 'src'),
  path.join('test', 'frontend', 'src'),
];

/**
 * Execute the build script with specified directories
 * @param {Array} directories - Array of directory paths
 * @returns {Promise<Object>} - Resolves with { code, stdout, stderr }
 */
function executeBuildScript(directories) {
  return new Promise((resolve, reject) => {
    const buildScriptPath = path.resolve(__dirname, '..', 'customBuildScripts.js');
    const buildProcess = spawn('node', [buildScriptPath, ...directories], {
      cwd: path.resolve(__dirname, '..'),
    });

    let stdout = '';
    let stderr = '';

    buildProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    buildProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    buildProcess.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

/**
 * Run the tests
 */
async function runTests() {
  console.log('Running Sanitization..\n');

  const result = await executeBuildScript(TEST_DIRECTORIES);

  console.log('=== Build Script Output ===\n');
  console.log(result.stdout);
  if (result.stderr) {
    console.error('=== Build Script Errors ===\n');
    console.error(result.stderr);
  }

  console.log('=== Test Results ===\n');

  // Combine stdout and stderr for checking
  const combinedOutput = result.stdout + '\n' + result.stderr;

  // Expected Issues:
  // Circular Dependencies:
  //   1. ServiceA.ts -> ServiceB.ts -> ServiceA.ts
  // Unused Variables:
  //   1. UnusedService.ts: tempService
  //   2. ComponentA.ts: unusedVar
  //   3. Unused.ts: temp

  const expectedCircularDependencies = [
    ['ServiceA.ts', 'ServiceB.ts', 'ServiceA.ts'],
  ];

  const expectedUnusedVariables = [
    { module: 'UnusedService.ts', variable: 'tempService' },
    { module: 'ComponentA.ts', variable: 'unusedVar' },
    { module: 'Unused.ts', variable: 'temp' },
  ];

  let circularDepDetected = true;
  expectedCircularDependencies.forEach((cycle) => {
    const cyclePatternBasename = cycle.join(' -> ');
    if (!combinedOutput.includes(cyclePatternBasename)) {
      console.error(`❌ Expected circular dependency not detected: ${cyclePatternBasename}`);
      circularDepDetected = false;
    }
  });
  if (circularDepDetected) {
    console.log('✅ All expected circular dependencies detected.');
  } else {
    console.error('❌ Some expected circular dependencies were not detected.');
  }

  let unusedVarsDetected = true;
  expectedUnusedVariables.forEach((item) => {
    const expectedVarPattern = `${item.module}: ${item.variable}`;
    if (!combinedOutput.includes(expectedVarPattern)) {
      console.error(`❌ Expected unused variable not detected: ${expectedVarPattern}`);
      unusedVarsDetected = false;
    }
  });
  if (unusedVarsDetected) {
    console.log('✅ All expected unused variables detected.');
  } else {
    console.error('❌ Some expected unused variables were not detected.');
  }

  if (result.code !== 0) {
    console.log('\n🔴 Build script exited with errors as expected.');
  } else {
    console.error('\n❌ Build script did not detect any issues, but issues were expected.');
  }

  console.log('\nTest Suite Completed.');
}

runTests();