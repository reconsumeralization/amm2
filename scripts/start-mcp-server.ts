#!/usr/bin/env tsx

import { initializeMCPServer, defaultMCPConfig, shutdownMCPServer } from '../src/mcp/server-setup';
import { config } from 'dotenv';

// Load environment variables
config();

async function main() {
  console.log('🎯 Starting Modern Men Hair BarberShop MCP Server');
  console.log('================================================\n');

  try {
    // Override default config with environment variables
    const serverConfig = {
      ...defaultMCPConfig,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || defaultMCPConfig.supabaseUrl,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || defaultMCPConfig.supabaseKey,
      payloadSecret: process.env.PAYLOAD_SECRET || defaultMCPConfig.payloadSecret,
      port: parseInt(process.env.MCP_PORT || '3001'),
      enableRealtime: process.env.ENABLE_REALTIME !== 'false',
      enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false'
    };

    // Validate configuration
    if (!serverConfig.supabaseUrl || !serverConfig.supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    }

    if (!serverConfig.payloadSecret) {
      console.warn('⚠️  Missing Payload CMS secret. Some features may not work correctly.');
    }

    // Initialize the MCP server
    const server = await initializeMCPServer(serverConfig);

    console.log('\n✅ MCP Server started successfully!');
    console.log(`🔗 WebSocket endpoint: ws://localhost:${serverConfig.port}`);
    console.log(`📊 Analytics: ${serverConfig.enableAnalytics ? 'Enabled' : 'Disabled'}`);
    console.log(`⚡ Real-time: ${serverConfig.enableRealtime ? 'Enabled' : 'Disabled'}`);

    // Available MCP methods
    console.log('\n📋 Available MCP Methods:');
    console.log('========================');
    console.log('🔐 Authentication:');
    console.log('  - authenticate');
    console.log('  - logout');
    console.log('\n👥 User Management:');
    console.log('  - getUsers, getUser, createUser, updateUser, deleteUser');
    console.log('  - changeUserRole, bulkUpdateUsers');
    console.log('\n👨‍💼 Customer Management:');
    console.log('  - getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer');
    console.log('\n📅 Appointment Management:');
    console.log('  - getAppointments, getAppointment, createAppointment, updateAppointment');
    console.log('  - cancelAppointment, bookAppointment, getAppointmentAvailability');
    console.log('\n💇‍♂️ Staff Management:');
    console.log('  - getStaff, getStaffMember, updateStaffMember');
    console.log('  - getStaffSchedule, updateStaffSchedule');
    console.log('\n✂️ Services Management:');
    console.log('  - getServices, getService, createService, updateService');
    console.log('\n📦 Products Management:');
    console.log('  - getProducts, getProduct, createProduct, updateProduct');
    console.log('\n📊 Analytics & Reporting:');
    console.log('  - getAnalytics, getDashboardStats, generateReport');
    console.log('\n📝 Content Management:');
    console.log('  - getPages, getPage, createPage, updatePage');
    console.log('  - getBlogPosts, createBlogPost');
    console.log('\n🔍 Search:');
    console.log('  - search');
    console.log('\n💼 Business Logic:');
    console.log('  - processPayment, addLoyaltyPoints, sendNotification');
    console.log('\n🤖 AI/ML Features:');
    console.log('  - generateConsultation, analyzeCustomerPreferences');
    console.log('  - predictAppointmentNoShow, optimizeSchedule, generateMarketingContent');

    console.log('\n🎮 LLM Chatbot Integration:');
    console.log('===========================');
    console.log('The MCP server provides a comprehensive interface for LLM chatbots to:');
    console.log('• Control all aspects of the Modern Men Hair BarberShop application');
    console.log('• Perform CRUD operations on all entities with proper RBAC');
    console.log('• Access real-time data and analytics');
    console.log('• Execute business logic operations');
    console.log('• Generate AI-powered insights and recommendations');
    console.log('• Manage content and marketing materials');
    console.log('• Handle customer interactions and support');

    console.log('\n🚀 Ready to accept LLM chatbot connections!');
    console.log('Press Ctrl+C to stop the server.\n');

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received shutdown signal...');
      await shutdownMCPServer();
      console.log('✅ MCP Server shut down gracefully.');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received termination signal...');
      await shutdownMCPServer();
      console.log('✅ MCP Server shut down gracefully.');
      process.exit(0);
    });

    // Keep the process running
    process.stdin.resume();

  } catch (error) {
    console.error('❌ Failed to start MCP Server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  shutdownMCPServer().finally(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  shutdownMCPServer().finally(() => {
    process.exit(1);
  });
});

// Run the main function
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
