// Logging utility - Production için optimize edilmiş
const isDevelopment = import.meta.env.DEV;

class Logger {
  constructor() {
    this.isDev = isDevelopment;
  }

  // Development'da console.log, production'da sessiz
  log(...args) {
    if (this.isDev) {
      console.log(...args);
    }
  }

  // Development'da console.warn, production'da sessiz
  warn(...args) {
    if (this.isDev) {
      console.warn(...args);
    }
  }

  // Kritik hatalar için - her zaman logla ama production'da daha az detay
  error(...args) {
    if (this.isDev) {
      console.error(...args);
    } else {
      // Production'da sadece hata mesajını logla, stack trace'i değil
      console.error(args[0]);
    }
  }

  // Debug bilgileri - sadece development'da
  debug(...args) {
    if (this.isDev) {
      console.debug(...args);
    }
  }

  // Info mesajları
  info(...args) {
    if (this.isDev) {
      console.info(...args);
    }
  }
}

export default new Logger();