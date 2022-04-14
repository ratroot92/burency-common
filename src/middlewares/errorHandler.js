const { Response } = require("../helpers");
const AppError = require('../exceptions/ApiError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError({message,status:400});
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate  field value: ${value}, Please use another value`;
  return new AppError({message,status:400});
};

const handleValidationErrorDB = (err) => {
  const errors = Object.keys(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError({message,status:422});

};

const handleJWTsError = () => new AppError({message:"Invalid token, Please log in again",status:401});

const handleJWTExpiredError = () =>new AppError({message:'Your token has expired, Please log in again',status:401});

const sendErrorDev = (err,req, res) => {
  res.status(err.status).json({
    status: err.status,
    error: err,
    message: err.message,
  }); 
};

const sendErrorProd = (err,req, res) => {
  if (err.isOperational) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('Something went wrong');
    res.json(Response.exception({message:"Something went wrong"})
    );
  }
};

const errorHandler = (err, req, res, next) => {

  err.status = err.status || 500;

  if (process.env.APP_ENV == 'local') 
  {
    sendErrorDev(err, res);
  }
   else if (process.env.APP_ENV == 'production')
    {

    let error = { ...err };
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTsError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);

  }
};

module.exports = errorHandler;