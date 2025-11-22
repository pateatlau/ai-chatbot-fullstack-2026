import { errorLogService } from './error-log.service';
import { ErrorSeverity } from '../types';

export interface AlertConfig {
  enabled: boolean;
  severity: ErrorSeverity;
  app?: string;
  threshold: number; // Alert after N errors
  timeWindow: number; // in minutes
  webhookUrl?: string;
  emailTo?: string[];
}

export class ErrorAlertingService {
  private alertConfigs: AlertConfig[] = [];
  private errorCounts: Map<string, { count: number; timestamp: number }> =
    new Map();

  /**
   * Initialize alert configurations
   */
  initialize(configs: AlertConfig[]) {
    this.alertConfigs = configs;
  }

  /**
   * Register an alert configuration
   */
  addAlertConfig(config: AlertConfig) {
    this.alertConfigs.push(config);
  }

  /**
   * Check if an error should trigger alerts
   */
  async checkAndAlert(
    message: string,
    severity: ErrorSeverity,
    app: string,
    errorData?: Record<string, any>
  ): Promise<void> {
    for (const config of this.alertConfigs) {
      if (!config.enabled) continue;
      if (config.severity !== severity) continue;
      if (config.app && config.app !== app) continue;

      const key = `${severity}_${app}`;
      const now = Date.now();
      const existing = this.errorCounts.get(key);

      if (
        existing &&
        now - existing.timestamp < config.timeWindow * 60 * 1000
      ) {
        existing.count++;

        if (existing.count >= config.threshold) {
          await this.sendAlert(config, {
            message,
            severity,
            app,
            count: existing.count,
            timeWindow: config.timeWindow,
            ...errorData,
          });

          // Reset count after alert
          this.errorCounts.delete(key);
        }
      } else {
        this.errorCounts.set(key, { count: 1, timestamp: now });
      }
    }
  }

  /**
   * Send alert via webhook or email
   */
  private async sendAlert(config: AlertConfig, data: any): Promise<void> {
    try {
      if (config.webhookUrl) {
        await this.sendWebhook(config.webhookUrl, data);
      }

      if (config.emailTo && config.emailTo.length > 0) {
        await this.sendEmail(config.emailTo, data);
      }
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(url: string, data: any): Promise<void> {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'error_alert',
        timestamp: new Date().toISOString(),
        data,
      }),
    });
  }

  /**
   * Send email notification
   */
  private async sendEmail(recipients: string[], data: any): Promise<void> {
    // This would integrate with your email service
    // Example: SendGrid, AWS SES, or similar
    console.log('Email alert to:', recipients, data);
  }

  /**
   * Get alert statistics
   */
  async getAlertStats(fromDate?: Date, toDate?: Date) {
    const criticalsErrors = await errorLogService.getErrorLogs({
      limit: 1000,
      offset: 0,
      severity: ErrorSeverity.CRITICAL,
      fromDate,
      toDate,
    });

    return {
      totalCriticalErrors: criticalsErrors.length,
      alertsTriggered: this.alertConfigs.filter((c) => c.enabled).length,
      errorsByApp: criticalsErrors.reduce(
        (acc, err) => {
          acc[err.app] = (acc[err.app] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}

export const errorAlertingService = new ErrorAlertingService();
