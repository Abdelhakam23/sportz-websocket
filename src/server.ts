import express from "express";
import matchesRouters from "./features/matchs/routes/matchesRoutes";
import http from "http";
import { connectToWebSocket } from "./websocket";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const server = http.createServer(app);

app.use(express.json());

app.use("/matchs", matchesRouters);

 connectToWebSocket(server);


server.listen(PORT,HOST, () => {
  const baseUrl =HOST=== '0.0.0.0'?`http://localhost:${PORT}` : `http://${HOST}:${PORT}`
  console.log(`Server is running on port ${baseUrl}`);
  // console.log(`Websocket Server is Running on ${baseUrl.replace('http','ws')}/ws`);
  
});
