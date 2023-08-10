module.exports = (fn) => {
  //This return function - Express will call - when POST request hits the server
  //ALL THE MAGIC - THIS IS WAHT ALLOWS ME TO REMOVE THE TRY-CATCH BOILERPLATE
  //WRONG
  //return (fn) => fn(req, res, next).catch(next);
  return (req, res, next) => fn(req, res, next).catch(next);
};
