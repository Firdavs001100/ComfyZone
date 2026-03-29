import dotenv from "dotenv";
import mongoose from "mongoose";
import server from "./app";

dotenv.config({
  path: process.env.NODE_ENV === "production" ? ".env.production" : ".env",
  override: true,
});
mongoose.set("strictQuery", true);

mongoose
  .connect(process.env.MONGO_URL as string, {})
  .then((data) => {
    console.log("MONGODB connection success!");
    const PORT = process.env.PORT ?? 3005;
    server.listen(PORT, () => {
      console.info(`The server is running successfully on port: ${PORT}`);
      console.info(`Admin project on http://localhost:${PORT}/admin \n`);
    });
  })
  .catch((err) => {
    console.log("Error on connection DB: ", err);
  });
