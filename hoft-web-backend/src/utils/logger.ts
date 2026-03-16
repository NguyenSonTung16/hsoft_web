type LogLevel = "info" | "warn" | "error";

interface StructuredLogPayload {
  event: string;
  message: string;
  details?: Record<string, unknown>;
}

function writeLog(level: LogLevel, payload: StructuredLogPayload): void {
  const entry = {
    ts: new Date().toISOString(),
    level,
    ...payload,
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.info(line);
}

export const logger = {
  info: (event: string, message: string, details?: Record<string, unknown>) => {
    writeLog("info", { event, message, details });
  },
  warn: (event: string, message: string, details?: Record<string, unknown>) => {
    writeLog("warn", { event, message, details });
  },
  error: (event: string, message: string, details?: Record<string, unknown>) => {
    writeLog("error", { event, message, details });
  },
};
