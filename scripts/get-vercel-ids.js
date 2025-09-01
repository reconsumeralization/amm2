#!/usr/bin/env node

/**
 * Helper script to get Vercel Organization and Project IDs
 * Run with: node scripts/get-vercel-ids.js
 *
 * Requirements:
 * - Vercel CLI installed globally: npm install -g vercel
 * - Vercel token set: vercel login
 * - Or set VERCEL_TOKEN environment variable
 */

const { execSync } = require('child_process');

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error.message);
    return null;
  }
}

function getVercelInfo() {
  console.log('🔍 Getting Vercel Organization and Project Information...\n');

  // Check if Vercel CLI is available
  const vercelVersion = runCommand('vercel --version');
  if (!vercelVersion) {
    console.error('❌ Vercel CLI not found. Please install it:');
    console.error('   npm install -g vercel');
    console.error('   vercel login');
    process.exit(1);
  }

  console.log(`✅ Vercel CLI found: ${vercelVersion}\n`);

  // Get user info
  console.log('📋 User Information:');
  const userInfo = runCommand('vercel whoami');
  if (userInfo) {
    console.log(userInfo);
  }
  console.log('');

  // List teams/organizations
  console.log('🏢 Teams/Organizations:');
  const teams = runCommand('vercel teams list');
  if (teams) {
    console.log(teams);
  } else {
    console.log('No teams found or unable to retrieve team information.');
  }
  console.log('');

  // List projects
  console.log('📁 Projects:');
  const projects = runCommand('vercel projects list');
  if (projects) {
    console.log(projects);
  } else {
    console.log('No projects found or unable to retrieve project information.');
  }
  console.log('');

  console.log('📝 Instructions:');
  console.log('===============');
  console.log('');
  console.log('1. For ORGANIZATION_ID:');
  console.log('   - Look for "Team ID" in the teams list above');
  console.log('   - Or visit: https://vercel.com/dashboard → Settings → General → Team ID');
  console.log('');
  console.log('2. For PROJECT_ID:');
  console.log('   - Look for your project in the projects list above');
  console.log('   - Or visit: https://vercel.com/dashboard → [Your Project] → Settings → General → Project ID');
  console.log('');
  console.log('3. Add these to your GitHub secrets:');
  console.log('   - VERCEL_ORG_ID=<organization_id>');
  console.log('   - VERCEL_PROJECT_ID=<project_id>');
  console.log('   - VERCEL_TEAM_ID=<team_id> (same as org_id if using teams)');
  console.log('');

  console.log('🔗 Useful Links:');
  console.log('================');
  console.log('- Vercel Dashboard: https://vercel.com/dashboard');
  console.log('- Account Tokens: https://vercel.com/account/tokens');
  console.log('- Documentation: https://vercel.com/docs');
}

if (require.main === module) {
  getVercelInfo();
}

module.exports = { getVercelInfo };
