const validate = (schema) => (req, res, next) => {
  console.log("--- Data Received by Server ---");
  console.log(req.body); // This will show you exactly what the server sees
  console.log("-------------------------------");
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    console.error("--- ZOD VALIDATION ERROR ---", error);
    return res.status(400).json({ errors: error.errors });
  }
};

module.exports = validate;
