enum LogLevel {
  INFO = 0,
  WARN = 1,
  ERROR = 2,
}

class Logger {
  private static instance: Logger

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  public log(level: LogLevel, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString()
    const formattedMessage = `[${timestamp}] ${LogLevel[level]}: ${message}`

    switch (level) {
      case LogLevel.INFO:
        console.log(formattedMessage, ...args)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, ...args)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage, ...args)
        break
    }

    // In a real application, you might want to send logs to a server or store them locally
  }

  public info(message: string, ...args: any[]) {
    this.log(LogLevel.INFO, message, ...args)
  }

  public warn(message: string, ...args: any[]) {
    this.log(LogLevel.WARN, message, ...args)
  }

  public error(message: string, ...args: any[]) {
    this.log(LogLevel.ERROR, message, ...args)
  }
}

export const logger = Logger.getInstance()
