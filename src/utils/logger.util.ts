/**
 * Logger Utility
 * Centralized logging service for the application
 */

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Format log entry
   */
  private formatLog(level: LogLevel, message: string, data?: any): ILogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(entry: ILogEntry): void {
    const { timestamp, level, message, data } = entry;

    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };

    const reset = '\x1b[0m';
    const colorCode = colors[level];

    const logMessage = `${colorCode}[${timestamp}] [${level}]${reset} ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        this.isDevelopment && console.debug(logMessage, data || '');
        break;
      case LogLevel.INFO:
        console.log(logMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(logMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(logMessage, data || '');
        break;
    }
  }

  /**
   * Debug log
   */
  debug(message: string, data?: any): void {
    const entry = this.formatLog(LogLevel.DEBUG, message, data);
    this.logToConsole(entry);
  }

  /**
   * Info log
   */
  info(message: string, data?: any): void {
    const entry = this.formatLog(LogLevel.INFO, message, data);
    this.logToConsole(entry);
  }

  /**
   * Warning log
   */
  warn(message: string, data?: any): void {
    const entry = this.formatLog(LogLevel.WARN, message, data);
    this.logToConsole(entry);
  }

  /**
   * Error log
   */
  error(message: string, error?: any): void {
    const errorData = error instanceof Error ? error.message : error;
    const entry = this.formatLog(LogLevel.ERROR, message, errorData);
    this.logToConsole(entry);
  }
}

export default new Logger();
