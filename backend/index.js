const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const app = express();
 require("dotenv").config();
const PORT = 3000;

const authRouter = require("./routes/authRoute");

const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

dbConnect();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/user", authRouter);


app.listen(PORT, () => {
  console.log(`Server is running  at PORT ${PORT}`);
});
