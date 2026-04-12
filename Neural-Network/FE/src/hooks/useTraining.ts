import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { EpochUpdate } from "../types";

const API_URL = "http://localhost:8000";

export function useTrainingSocket(onMessage: (msg: EpochUpdate) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const socket = io(API_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    // Map Flask-SocketIO events → unified EpochUpdate handler
    const handle = (type: string) => (data: object) =>
      onMessageRef.current({ type: type as EpochUpdate["type"], ...data });

    socket.on("init", handle("init"));
    socket.on("training_started", handle("training_started"));
    socket.on("epoch_update", handle("epoch_update"));
    socket.on("training_complete", handle("training_complete"));

    return () => {
      socket.disconnect();
    };
  }, []);

  return { connected };
}

export async function startTraining(config: object) {
  const res = await fetch(`${API_URL}/train`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function stopTraining() {
  const res = await fetch(`${API_URL}/stop`, { method: "POST" });
  return res.json();
}
