/**
 * Zanzibar Trip & Relax - Enterprise Production Logger
 * Handles structured logging with categories, severity, and PII sanitization.
 */

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'ANALYTICS' | 'SECURITY';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  metadata?: any;
}

// Simple helper to sanitize sensitive values (PII)
export function sanitizeData(data: any): any {
  if (data === null || data === undefined) return data;
  
  if (typeof data === 'string') {
    // Sanitize Email addresses
    if (data.includes('@') && data.includes('.')) {
      const [local, domain] = data.split('@');
      if (local.length <= 2) return `*@${domain}`;
      return `${local.substring(0, 2)}***@${domain}`;
    }
    // Sanitize Phone/WhatsApp numbers (usually starts with + or numbers)
    if (/^\+?[0-9\s-]{6,16}$/.test(data)) {
      const clean = data.replace(/\s+/g, '');
      if (clean.length > 5) {
        return `${clean.substring(0, 4)}****${clean.substring(clean.length - 3)}`;
      }
    }
    // Sanitize any potential card or secret references
    if (/^\d{12,19}$/.test(data)) {
      return `****-****-****-${data.substring(data.length - 4)}`;
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  if (typeof data === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const lowerKey = key.toLowerCase();
        // Check if key is sensitive
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('token') ||
          lowerKey.includes('cvv') ||
          lowerKey.includes('card')
        ) {
          sanitizedObj[key] = '[REDACTED]';
        } else if (
          lowerKey.includes('email') ||
          lowerKey.includes('whatsapp') ||
          lowerKey.includes('phone') ||
          lowerKey.includes('number') ||
          lowerKey.includes('contact')
        ) {
          sanitizedObj[key] = sanitizeData(data[key]);
        } else {
          sanitizedObj[key] = sanitizeData(data[key]);
        }
      }
    }
    return sanitizedObj;
  }

  return data;
}

class ProductionLogger {
  private isDevelopment = (import.meta as any).env.DEV;

  private createLog(level: LogLevel, category: string, message: string, metadata?: any): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata: sanitizeData(metadata)
    };

    // Output to console in structured format
    const logString = `[ZTR-LOG] [${entry.timestamp}] [${entry.level}] [${entry.category}] - ${entry.message}`;
    
    if (level === 'ERROR') {
      console.error(logString, entry.metadata || '');
    } else if (level === 'WARN') {
      console.warn(logString, entry.metadata || '');
    } else {
      console.log(logString, entry.metadata || '');
    }

    // In a future production environment, these sanitized log entries can be batch-sent to a logging server (Datadog, LogRocket, Sentry, etc.)
    return entry;
  }

  info(category: string, message: string, metadata?: any) {
    return this.createLog('INFO', category, message, metadata);
  }

  warn(category: string, message: string, metadata?: any) {
    return this.createLog('WARN', category, message, metadata);
  }

  error(category: string, message: string, metadata?: any) {
    return this.createLog('ERROR', category, message, metadata);
  }

  analytics(category: string, eventName: string, params?: any) {
    return this.createLog('ANALYTICS', category, `GA4 Event Tracked: ${eventName}`, params);
  }

  security(category: string, message: string, metadata?: any) {
    return this.createLog('SECURITY', category, message, metadata);
  }
}

export const logger = new ProductionLogger();
