/**
 * Environment Configuration
 * 
 * This module provides a centralized way to manage environment-specific configurations.
 * Currently, the Supabase URL and key are hardcoded for the production environment,
 * but this can be extended to support multiple environments (dev, staging, prod).
 */

export type Environment = 'development' | 'staging' | 'production';

interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  name: Environment;
}

// Current production configuration
const productionConfig: EnvironmentConfig = {
  name: 'production',
  supabaseUrl: 'https://oorsclbnzfujgxzxfruj.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vcnNjbGJuemZ1amd4enhmcnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDA5ODcsImV4cCI6MjA4MDgxNjk4N30.Tmyhta0ON7b8z85nnFAfjmtJnRQiMhBXTdLet52cQ78',
};

// For now, we only have production environment
// This can be extended to support dev/staging when needed
const environments: Record<Environment, EnvironmentConfig> = {
  development: productionConfig, // Currently using production for all
  staging: productionConfig,     // Currently using production for all
  production: productionConfig,
};

// Determine current environment
function getCurrentEnvironment(): Environment {
  // In the future, this can read from environment variables or build-time config
  // For now, we default to production
  return 'production';
}

export const currentEnvironment = getCurrentEnvironment();
export const config = environments[currentEnvironment];

// Helper to check environment
export const isDevelopment = currentEnvironment === 'development';
export const isStaging = currentEnvironment === 'staging';
export const isProduction = currentEnvironment === 'production';
