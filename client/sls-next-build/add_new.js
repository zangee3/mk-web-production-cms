
  const page = require("./add_new.original.js");
  const handlerFactory = require("serverless-nextjs-plugin/aws-lambda-compat");

  module.exports.render = (event, context, callback) => {
    const handler = handlerFactory(page);
    handler(event, context, callback);
  };