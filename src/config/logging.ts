/* istanbul ignore file */

let globalLogger: Logger = {};

const globalSpecialLoggingEnabledFor: Partial<Record<SpecialLoggingType, boolean | undefined>> = {
  'binding-lock-duration-warnings': false
};

export interface Logger {
  debug?: (message?: any, ...optionalParams: any[]) => void;
  error?: (message?: any, ...optionalParams: any[]) => void;
  info?: (message?: any, ...optionalParams: any[]) => void;
  log?: (message?: any, ...optionalParams: any[]) => void;
  warn?: (message?: any, ...optionalParams: any[]) => void;
}

/** Gets the logger registered using `setLogger` */
export const getLogger = () => globalLogger;

/** Sets the logger to be used.  It's not recommended to set a logger in production environments */
export const setLogger = (logger: Logger) => {
  globalLogger = logger;
};

export type SpecialLoggingType = 'binding-lock-duration-warnings';

/** Checks if logging is enabled for the specified type */
export const isSpecialLoggingEnabledFor = (type: SpecialLoggingType) => globalSpecialLoggingEnabledFor[type] ?? false;

/** Enables or disables logging for the specified type */
export const setSpecialLoggingEnabledFor = (type: SpecialLoggingType, enabled: boolean) => (globalSpecialLoggingEnabledFor[type] = enabled);
