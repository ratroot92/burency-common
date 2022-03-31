const { Response } = require("../helpers");

const errorHandler = function (err, req, res, next) {
  if (err.status === 404) {
    res.status(err.status);
    res.json(Response.invalid({ message: err.message }));
  }
  res.status(err.status || 500);
  res.json(Response.exception({ message: err.message }));
};

module.exports = errorHandler;
