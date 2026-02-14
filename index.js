require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App running in port ${PORT} ${process.env.NODE_ENV}`);
});
