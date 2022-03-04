class DatabaseConnectionError extends Error {
  constructor() {
    super();
  }
  /**
   *
   * @returns object
   */
  static handler(data = {}) {
    return data;
  }
}

module.exports = DatabaseConnectionError;
