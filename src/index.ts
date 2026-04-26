#!/usr/bin/env node

import { BacklogItem, EstimationConfig } from './types';
import { ProjectEstimator } from './estimator';
import { DEFAULT_CONFIG } from './config';
import { ExportUtils } from './exportUtils';
import { TeamAllocator } from './teamAllocator';
import { PromptTemplates } from './promptTemplates';
import { validateBacklog, validateConfig } from './validation';
import * as fs from 'fs';

/**
 * Main entry point for the Project Estimator CLI
 */
function main() {
  console.log('\n🚀 Project Estimation Tool\n');

  const args = process.argv.slice(2);

  // Check for help flag
  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // Check for example flag
  if (args.includes('--example')) {
    generateExampleFiles();
    return;
  }

  // Check for AI prompt template flag
  if (args.includes('--prompts')) {
    generatePromptExamples();
    return;
  }

  // Look for input file
  const inputFileIndex = args.findIndex((arg) => arg === '--input' || arg === '-i');
  const inputFile = inputFileIndex >= 0 ? args[inputFileIndex + 1] : 'backlog.json';

  // Look for config file
  const configFileIndex = args.findIndex((arg) => arg === '--config' || arg === '-c');
  const configFile = configFileIndex >= 0 ? args[configFileIndex + 1] : null;

  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file "${inputFile}" not found.`);
    console.log('\n💡 Run with --example to generate sample files, or --help for usage info.\n');
    return;
  }

  try {
    // Load backlog
    const backlogData = fs.readFileSync(inputFile, 'utf-8');
    let backlog: BacklogItem[];
    try {
      backlog = validateBacklog(JSON.parse(backlogData));
    } catch (parseError) {
      if (parseError instanceof SyntaxError) {
        throw new Error(`Invalid JSON in ${inputFile}: ${parseError.message}`);
      }
      throw parseError;
    }

    console.log(`📂 Loaded ${backlog.length} items from ${inputFile}`);

    // Load config (or use defaults)
    let config: EstimationConfig = { ...DEFAULT_CONFIG };
    if (configFile && fs.existsSync(configFile)) {
      const configData = fs.readFileSync(configFile, 'utf-8');
      let customConfig: any;
      try {
        customConfig = JSON.parse(configData);
      } catch (parseError) {
        throw new Error(`Invalid JSON in ${configFile}: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }
      const validatedConfig = validateConfig(customConfig);
      config = { ...config, ...validatedConfig };
      console.log(`⚙️  Loaded custom config from ${configFile}`);
    } else {
      console.log(`⚙️  Using default configuration`);
    }

    // Run estimation
    console.log('\n🔄 Running estimation...\n');
    const estimator = new ProjectEstimator(backlog, config);
    const result = estimator.estimate();

    // Validate team composition
    const validation = TeamAllocator.validateTeamComposition(result.teamComposition);
    if (!validation.valid) {
      console.log('\n⚠️  Team Composition Warnings:');
      validation.warnings.forEach((warning) => console.log(`  • ${warning}`));
    }

    // Print summary to console
    ExportUtils.printSummary(result);

    // Export results
    const outputFormat = args.includes('--csv') ? 'csv' : 'json';

    if (outputFormat === 'csv') {
      ExportUtils.exportToCSV(result, 'estimation.csv');
      ExportUtils.exportGanttToCSV(result.ganttData, 'gantt.csv');
    } else {
      ExportUtils.exportToJSON(result, 'estimation.json');
    }

    console.log('✨ Estimation complete!\n');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Usage: npm run estimate [options]

Options:
  -i, --input <file>     Input backlog JSON file (default: backlog.json)
  -c, --config <file>    Configuration JSON file (optional)
  --csv                  Export results as CSV instead of JSON
  --example              Generate example backlog and config files
  --prompts              Show AI prompt template examples
  -h, --help             Show this help message

Examples:
  npm run estimate
  npm run estimate -- --input my-backlog.json --csv
  npm run estimate -- --input backlog.json --config custom-config.json
  npm run estimate -- --example

For more information, see README.md
`);
}

function generateExampleFiles() {
  // Example backlog
  const exampleBacklog: BacklogItem[] = [
    {
      epic: 'Authentication',
      feature: 'User Login',
      tshirt_size: 'M',
      roles: ['Fullstack', 'QA'],
    },
    {
      epic: 'Authentication',
      feature: 'Password Reset',
      tshirt_size: 'S',
      roles: ['Fullstack', 'QA'],
    },
    {
      epic: 'Authentication',
      feature: 'OAuth Integration',
      tshirt_size: 'L',
      roles: ['Fullstack', 'DevOps', 'QA'],
    },
    {
      epic: 'User Profile',
      feature: 'Profile Page',
      tshirt_size: 'M',
      roles: ['Fullstack', 'UX', 'QA'],
    },
    {
      epic: 'User Profile',
      feature: 'Avatar Upload',
      tshirt_size: 'S',
      roles: ['Fullstack', 'QA'],
    },
    {
      epic: 'Dashboard',
      feature: 'Analytics Dashboard',
      tshirt_size: 'XL',
      roles: ['Fullstack', 'UX', 'QA'],
    },
    {
      epic: 'Dashboard',
      feature: 'Data Export',
      tshirt_size: 'M',
      roles: ['Fullstack', 'QA'],
    },
    {
      epic: 'Notifications',
      feature: 'Email Notifications',
      tshirt_size: 'L',
      roles: ['Fullstack', 'QA'],
    },
    {
      epic: 'Notifications',
      feature: 'Push Notifications',
      tshirt_size: 'XL',
      roles: ['Fullstack', 'DevOps', 'QA'],
    },
    {
      epic: 'Admin Panel',
      feature: 'User Management',
      tshirt_size: 'L',
      roles: ['Fullstack', 'QA'],
    },
  ];

  // Example config
  const exampleConfig: EstimationConfig = {
    hoursPerDay: 6,
    sprintLengthWeeks: 2,
    unitTestingPercentage: 15,
    bugFixingPercentage: 20,
    documentationPercentage: 10,
    contingencyPercentage: 15,
    startDate: '2025-11-03',
  };

  fs.writeFileSync('backlog.json', JSON.stringify(exampleBacklog, null, 2));
  fs.writeFileSync('config.json', JSON.stringify(exampleConfig, null, 2));

  console.log('✅ Example files generated:');
  console.log('   - backlog.json (10 sample backlog items)');
  console.log('   - config.json (estimation parameters)');
  console.log('\n💡 Run "npm run estimate" to estimate the example backlog\n');
}

function generatePromptExamples() {
  console.log('\n🤖 AI PROMPT TEMPLATE EXAMPLES\n');
  console.log('Use these prompts with OpenAI, Claude, or other LLMs to enhance your estimation:\n');

  console.log('─'.repeat(60));
  console.log('1. EFFORT ESTIMATION PROMPT');
  console.log('─'.repeat(60));
  const effortPrompt = PromptTemplates.getEffortEstimationPrompt(
    'Build a user authentication system with email/password and OAuth support'
  );
  console.log(effortPrompt);

  console.log('\n' + '─'.repeat(60));
  console.log('2. FEATURE BREAKDOWN PROMPT');
  console.log('─'.repeat(60));
  const breakdownPrompt = PromptTemplates.getFeatureBreakdownPrompt(
    'E-commerce checkout flow with payment integration'
  );
  console.log(breakdownPrompt);

  console.log('\n' + '─'.repeat(60));
  console.log('3. STAKEHOLDER SUMMARY PROMPT');
  console.log('─'.repeat(60));
  const summaryPrompt = PromptTemplates.getStakeholderSummaryPrompt(
    {
      backlogItemCount: 10,
      totalBaseHours: 500,
      roleEfforts: [],
      teamComposition: [],
      totalCost: 50000,
      durationDays: 70,
      durationWeeks: 10,
      durationSprints: 5,
      startDate: '2025-11-03',
      endDate: '2026-01-12',
      workingDays: 50,
      assumptions: [],
      ganttData: [],
    },
    'Customer Portal Redesign'
  );
  console.log(summaryPrompt);

  console.log('\n💡 Copy these prompts and customize them for your specific project needs.\n');
}

// Run the CLI
if (require.main === module) {
  main();
}

export { ProjectEstimator, TeamAllocator, PromptTemplates, ExportUtils };

