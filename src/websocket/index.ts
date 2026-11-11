import WebSocket, { WebSocketServer } from "ws";

import { Server as HttpServer } from "http";

let wss: WebSocketServer;

interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}
const sendJson = (socket: WebSocket, payLoad: Record<string, unknown>) => {
  if (socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify(payLoad));
};

const broadcast = (payLoad: Record<string, unknown>) => {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payLoad));
    }
  });
};

export const connectToWebSocket = (server: HttpServer) => {
  wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024 * 1024,
  });
  wss.on("connection", (socket: ExtWebSocket) => {
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });
    sendJson(socket, { type: "Connected" });
    socket.on("error", console.error);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      const extClient = client as ExtWebSocket;
      if (extClient.isAlive === false) {
        return client.terminate();
      }

      extClient.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(interval);
  });
};

export const broadcastMatchCreated = (match: Record<string, unknown>) => {
  broadcast({ type: "Match Created", match });
};
