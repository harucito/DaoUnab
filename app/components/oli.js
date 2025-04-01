import { useEffect, useState } from "react";
import { ethers } from "ethers";

const contractAddress = "TU_CONTRATO_ADDRESS"; // 🟢 REEMPLAZA con la dirección real de tu contrato
const contractABI = [
  "event VotingRestarted(uint256 newStartTime, uint256 newEndTime)",
  "function getNextVotingTime() view returns (uint256)"
];

export default function VotingNotifications() {
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    const listenForRestartEvent = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);

        // 📌 Escuchar el evento VotingRestarted
        contract.on("VotingRestarted", (newStartTime, newEndTime) => {
          const startTime = new Date(newStartTime.toNumber() * 1000);

          // 🛑 Notificación de alerta
          alert(`⚠️ Hubo un empate, la votación se reiniciará el ${startTime.toLocaleString()}`);

          // 🔔 Enviar notificación push
          notifyUser(`La votación se reiniciará el ${startTime.toLocaleString()}`);
        });

        // 📌 Consultar el tiempo restante si ya hay una votación programada
        try {
          const nextVotingTime = await contract.getNextVotingTime();
          setRemainingTime(nextVotingTime.toNumber());
        } catch (error) {
          console.log("No hay votación pendiente");
        }
      }
    };

    listenForRestartEvent();

    return () => {
      // 🛑 Limpiar eventos al desmontar el componente
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        contract.removeAllListeners("VotingRestarted");
      }
    };
  }, []);

  // 📌 Función para enviar una notificación push
  const notifyUser = (message) => {
    if (Notification.permission === "granted") {
      new Notification("📢 Nueva Votación", { body: message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification("📢 Nueva Votación", { body: message });
        }
      });
    }
  };

  return (
    <div>
      {remainingTime !== null && (
        <p>⏳ La próxima votación comienza en {Math.floor(remainingTime / 60)} minutos.</p>
      )}
    </div>
  );
}
