import WebSocket, { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import { websocketMiddleware } from "../arcjet";

let wss: WebSocketServer;

const broadcast = (payLoad: Record<string, unknown>) => {
  wss.clients.forEach((client) => {
    client.readyState === WebSocket.OPEN &&
      client.send(JSON.stringify(payLoad));
  });
};

export const connectToWebSocket = (server: HttpServer) => {
  wss = new WebSocketServer({ noServer: true, path: "/ws" });

  server.on("upgrade", async (request, socket, head) => {
    try {
      const decision = await websocketMiddleware.protect(request, {
        requested: 1,
      });
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          socket.write(
            "HTTP/1.1 429 Too Many Requests\r\n" +
              "Content-Type: text/plain\r\n" +
              "Connection: close\r\n\r\n" +
              "Too Many Requests",
          );
        } else {
          socket.write(
            "HTTP/1.1 403 Forbidden\r\n" +
              "Content-Type: text/plain\r\n" +
              "Connection: close\r\n\r\n" +
              "Forbidden",
          );
        }
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } catch (error) {
      console.error("Arcjet WebSocket protection error:", error);
      socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
      socket.destroy();
    }
  });

  wss.on("connection", (socket) => {
    socket.on("error", (err) => {
      console.error(`Error on socket:`, err);
    });

    socket.on("close", () => {
      console.log(`Connection closed`);
    });
  });
};

export const broadcastMatchCreated = (match: Record<string, unknown>) => {
  broadcast({ type: "match_created", data: match });
};
