/**
 * Jira Configuration Management
 * Handles storing and retrieving Jira instance configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import { JiraConfig } from './types';

export class JiraConfigManager {
  private configPath: string;
  private configData: Map<string, JiraConfig>;

  constructor(configDir: string = '.jira-config') {
    this.configPath = path.join(process.cwd(), configDir);
    this.configData = new Map();
    this.ensureConfigDir();
    this.loadConfigs();
  }

  /**
   * Ensure config directory exists
   */
  private ensureConfigDir(): void {
    if (!fs.existsSync(this.configPath)) {
      fs.mkdirSync(this.configPath, { recursive: true });
    }
  }

  /**
   * Load all configurations from disk
   */
  private loadConfigs(): void {
    try {
      if (fs.existsSync(this.configPath)) {
        const files = fs.readdirSync(this.configPath).filter((f) => f.endsWith('.json'));
        for (const file of files) {
          const configFile = path.join(this.configPath, file);
          const data = fs.readFileSync(configFile, 'utf-8');
          const config = JSON.parse(data) as JiraConfig;
          const name = file.replace('.json', '');
          this.configData.set(name, config);
        }
      }
    } catch (error) {
      console.error(`Failed to load Jira configs: ${error}`);
    }
  }

  /**
   * Save configuration
   */
  saveConfig(name: string, config: JiraConfig): void {
    try {
      this.configData.set(name, config);
      const filePath = path.join(this.configPath, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
      console.log(`Jira configuration saved: ${name}`);
    } catch (error) {
      throw new Error(`Failed to save Jira config: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Get configuration by name
   */
  getConfig(name: string = 'default'): JiraConfig | undefined {
    return this.configData.get(name);
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): Map<string, JiraConfig> {
    return new Map(this.configData);
  }

  /**
   * Delete configuration
   */
  deleteConfig(name: string): void {
    try {
      this.configData.delete(name);
      const filePath = path.join(this.configPath, `${name}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.log(`Jira configuration deleted: ${name}`);
    } catch (error) {
      throw new Error(`Failed to delete Jira config: ${error instanceof Error ? error.message : error}`);
    }
  }

  /**
   * Validate configuration
   */
  validateConfig(config: JiraConfig): boolean {
    return !!(config.host && config.username && config.apiToken && config.projectKey);
  }

  /**
   * Create config from environment variables
   */
  static fromEnv(): JiraConfig | null {
    const host = process.env.JIRA_HOST;
    const username = process.env.JIRA_USERNAME;
    const apiToken = process.env.JIRA_API_TOKEN;
    const projectKey = process.env.JIRA_PROJECT_KEY;

    if (host && username && apiToken && projectKey) {
      return {
        host,
        username,
        apiToken,
        projectKey,
      };
    }

    return null;
  }
}
