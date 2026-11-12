import WebSocket, { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";

//  Server   ,  PayLoad , Broadcasting

let wss: WebSocketServer;

const broadcast = (payLoad: Record<string, unknown>) => {
  wss.clients.forEach((client) => {
    client.readyState === WebSocket.OPEN &&
      client.send(JSON.stringify(payLoad));
  });
};

export const connectToWebSocket = (server: HttpServer) => {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket) => {
    socket.on("error", (err) => {
      console.error(`Error on socket:`, err);
    });

    socket.on("close", () => {
      console.log(`Connection closed`);
    });
  });

  console.log("WebSocket is Running ");
};

export const broadcastMatchCreated = (match: Record<string, unknown>) => {
  broadcast({ type: "match_created", data: match });
};
