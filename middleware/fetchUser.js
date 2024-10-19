var jwt = require("jsonwebtoken");
const JWT_SECRET = "ILoveSwscho";
//TO-DO: JWT_SECRET should be a long random string and stored in a .env file

const fetchUser = (req, res, next) => {
  // GET the USER from the JWT-TOKEN and ADD ID to req object
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

module.exports = fetchUser;
