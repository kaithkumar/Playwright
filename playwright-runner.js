#!/usr/bin/env node
const { loadConfiguration, runCucumber } = require('@cucumber/cucumber/api');

async function run() {
  try {
    // Support --headed flag for Playwright steps
    const invokedArgs = process.argv.slice(2);
    const headedIndex = invokedArgs.indexOf('--headed');
    if (headedIndex !== -1) {
      process.env.CUCUMBER_PLAYWRIGHT_HEADED = 'true';
      invokedArgs.splice(headedIndex, 1);
    }

    const defaultArgs = [
      'node',
      'cucumber-js',
      'tests/features/**/*.feature',
      '--require',
      'tests/features/steps/**/*.js',
      '--format',
      'progress'
    ];

    const argv = invokedArgs.length ? ['node', 'cucumber-js', ...invokedArgs] : defaultArgs;
    const cwd = process.cwd();

    const { runConfiguration } = await loadConfiguration({ provided: argv }, { cwd });
    const environment = { cwd, stdout: process.stdout, stderr: process.stderr };
    const { success } = await runCucumber(runConfiguration, environment);
    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('Runner error:', err);
    process.exit(1);
  }
}

run();
