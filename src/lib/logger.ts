type LogLevel = "debug" | "info" | "warn" | "error";

interface LogFields {
  service?: string;
  operation?: string;
  userId?: string;
  [key: string]: unknown;
}

const SERVICE = "offgrid-web";

function emit(level: LogLevel, message: string, fields: LogFields = {}) {
  if (import.meta.env.PROD && level === "debug") return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: SERVICE,
    ...fields,
  };

  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else if (level === "info") console.info(line);
  else console.debug(line);
}

export const logger = {
  debug: (message: string, fields?: LogFields) => emit("debug", message, fields),
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
};
