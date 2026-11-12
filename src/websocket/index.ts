import WebSocket, { WebSocketServer } from "ws";
import { Server as HttpServer } from "http";

//  Server   ,  PayLoad , Broadcasting

let wss: WebSocketServer;

interface extWebSocket extends WebSocket{
  isAlive: boolean;
}

const broadcast = (payLoad: Record<string, unknown>) => {
  wss.clients.forEach((client) => {
    client.readyState === WebSocket.OPEN &&
      client.send(JSON.stringify(payLoad));
  });
};

export const connectToWebSocket = (server: HttpServer) => {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (socket:extWebSocket) => {
    socket.isAlive = true;

    socket.on('pong',()=>{
      socket.isAlive = true;
    })

    const interval = setInterval(()=>{
      wss.clients.forEach((client)=>{
        const extClient = client as extWebSocket;
        if(!extClient.isAlive){
        return  extClient.terminate();
        }

        extClient.isAlive = false;
        client.ping();

      })
    },30000)
    socket.on("error", (err) => {
      console.error(`Error on socket:`, err);
    });

    socket.on("close", () => {
      clearInterval(interval)
    });
  });

  console.log("WebSocket is Running ");
};

export const broadcastMatchCreated = (match: Record<string, unknown>) => {
  broadcast({ type: "match_created", data: match });
};
