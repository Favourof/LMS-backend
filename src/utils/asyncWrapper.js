// create a higher order function to wrap async controller, automatically catching the error and passing them to global errorHandler
const asyncWrapper = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = asyncWrapper;
