import express from "express";
import matchsRouters from "./features/matchs/routes/matchsRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/matchs", matchsRouters);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
