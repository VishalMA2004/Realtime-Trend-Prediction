import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

export const useMarketSocket = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    socket.on("market:update", setSnapshot);
    socket.on("market:alerts", setAlerts);

    return () => {
      socket.off("market:update", setSnapshot);
      socket.off("market:alerts", setAlerts);
    };
  }, []);

  return { snapshot, alerts };
};
