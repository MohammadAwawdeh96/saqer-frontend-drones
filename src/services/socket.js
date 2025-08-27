import { io } from "socket.io-client";
import { upsertFromFeatureCollection } from "../store/dronesSlice";

let socket;
export function startSocket(store) {
  socket = io("http://localhost:9013", {
    transports: ["polling"],
  });

  socket.on("connect", () => {
    console.log("[WS] connected:", socket.id);
  });

  socket.on("message", (data) => {
  
    store.dispatch(upsertFromFeatureCollection(data));
  });
}