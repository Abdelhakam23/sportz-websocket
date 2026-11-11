import express from "express";
import matchesRouters from "./features/matchs/routes/matchesRoutes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/matchs", matchesRouters);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
