/**
 * Metrics Collection Module
 */

interface RequestMetrics {
  timestamp: number;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
}

class MetricsCollector {
  private metrics: RequestMetrics[] = [];
  private maxSize: number = 1000;

  recordRequest(method: string, path: string, statusCode: number, duration: number) {
    this.metrics.push({
      timestamp: Date.now(),
      method,
      path,
      statusCode,
      duration,
    });

    if (this.metrics.length > this.maxSize) {
      this.metrics.shift();
    }
  }

  getMetrics() {
    return {
      totalRequests: this.metrics.length,
      averageResponseTime:
        this.metrics.reduce((sum, m) => sum + m.duration, 0) / this.metrics.length || 0,
      errorCount: this.metrics.filter((m) => m.statusCode >= 400).length,
      metrics: this.metrics.slice(-100), // Last 100 requests
    };
  }

  clear() {
    this.metrics = [];
  }
}

export const metricsCollector = new MetricsCollector();
