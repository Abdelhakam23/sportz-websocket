import WebSocket, { RawData, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import { websocketMiddleware } from "../arcjet";

interface WebSocketWithSubscribtions extends WebSocket {
  subscribtions: Set<string>;
}
let wss: WebSocketServer;
const matchSubscribers = new Map();
const subscribe = (matchId: string, socket: WebSocket) => {
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  matchSubscribers.get(matchId).add(socket);
};

const unsubscribe = (matchId: string, socket: WebSocket) => {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers) return;
  subscribers.delete(socket);
  if (subscribers.size === 0) {
    matchSubscribers.delete(matchId);
  }
};

const cleanSubscribtions = (socket: WebSocketWithSubscribtions) => {
  for (const matchId of socket.subscribtions) {
    unsubscribe(matchId, socket);
  }
};

const broadcastToMatchSubscribers = (
  matchId: string,
  payLoad: Record<string, unknown>,
) => {
  const subscribers = matchSubscribers.get(matchId);
  if (!subscribers || subscribers.size === 0) return;

  const message = JSON.stringify(payLoad);
  for (const subscriber of subscribers) {
    subscriber.readyState === WebSocket.OPEN && subscriber.send(message);
  }
};
const handleMessage = (socket: WebSocketWithSubscribtions, data: RawData) => {
  let message:any;
  try {
    message = JSON.parse(data.toString());
  } catch {
    socket.send(
      JSON.stringify({ type: "error", message: "Invalid message format" }),
    );
  }

  if (message.type === "subscribe" && message.matchId) {
    subscribe(message.matchId, socket);
    socket.subscribtions.add(message.matchId);
    socket.send(
      JSON.stringify({ type: "subscribed", matchId: message.matchId }),
    );
    return;
  }
  if (message.type === "unsubscribe" && message.matchId) {
    unsubscribe(message.matchId, socket);
    socket.subscribtions.delete(message.matchId);
    socket.send(
      JSON.stringify({ type: "unsubscribed", matchId: message.matchId }),
    );
    return;
  }
};

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

  wss.on("connection", (socket: WebSocketWithSubscribtions) => {
    socket.subscribtions = new Set();
    socket.on("message", (data) => {
      handleMessage(socket, data);
    });
    socket.on("error", () => {
      socket.terminate();
    });
    socket.on("close", () => {
      cleanSubscribtions(socket);
    });
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
export const broadcastCommentAdded = (
  matchId: string,
  comment: Record<string, unknown>,
) => {
  broadcastToMatchSubscribers(matchId, {
    type: "comment_added",
    data: comment,
  });
};
