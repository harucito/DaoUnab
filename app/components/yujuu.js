import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./contractABI";

const VotingComponent = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [category, setCategory] = useState("");
  const [candidateIndex, setCandidateIndex] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [newCandidates, setNewCandidates] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);
        const signer = tempProvider.getSigner();
        const tempContract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(tempContract);
      }
    };
    initProvider();
  }, []);

  const voteForCandidate = async () => {
    if (!contract) return;
    try {
      const tx = await contract.vote(category, candidateIndex);
      await tx.wait();
    } catch (error) {
      console.error("Error al votar:", error);
    }
  };

  const fetchCandidates = async () => {
    if (!contract) return;
    try {
      const data = await contract.getElection(category);
      setCandidates(data[4].map((name, index) => ({ name, votes: data[5][index] })));
    } catch (error) {
      console.error("Error al obtener candidatos:", error);
    }
  };

  const fetchWinner = async () => {
    if (!contract) return;
    try {
      const winnerName = await contract.getElectionWinner(category, 1);
      setWinner(winnerName);
    } catch (error) {
      console.error("Error al obtener ganador:", error);
    }
  };

  const fetchTimeLeft = async () => {
    if (!contract) return;
    try {
      const remainingTime = await contract.getRemainingTime(category);
      setTimeLeft(remainingTime.toNumber());
    } catch (error) {
      console.error("Error al obtener tiempo restante:", error);
    }
  };

  const createElection = async () => {
    if (!contract) return;
    try {
      const candidatesArray = newCandidates.split(",").map(name => name.trim());
      const tx = await contract.startElection(category, candidatesArray, parseInt(duration));
      await tx.wait();
    } catch (error) {
      console.error("Error al crear elección:", error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Sistema de Votaciones</h2>

      <div className="mt-2">
        <label className="block text-gray-700 font-semibold">Categoría</label>
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 w-full rounded" />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button onClick={fetchCandidates} className="px-4 py-2 bg-blue-500 text-white rounded w-full">Obtener Candidatos</button>
        <button onClick={fetchWinner} className="px-4 py-2 bg-yellow-500 text-white rounded w-full">Ver Ganador</button>
        <button onClick={fetchTimeLeft} className="px-4 py-2 bg-gray-500 text-white rounded w-full">Tiempo Restante</button>
      </div>

      {candidates.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Candidatos</h3>
          <ul>
            {candidates.map((c, index) => (
              <li key={index} className="p-2 border rounded mt-2">{c.name} - {c.votes} votos</li>
            ))}
          </ul>
        </div>
      )}

      {winner && <p className="mt-4 font-bold text-green-500">Ganador: {winner}</p>}
      {timeLeft !== null && <p className="mt-4">Tiempo restante: {timeLeft} segundos</p>}

      <div className="mt-4">
        <label className="block text-gray-700 font-semibold">Índice del Candidato</label>
        <input type="number" value={candidateIndex} onChange={(e) => setCandidateIndex(e.target.value)} className="border p-2 w-full rounded" />
      </div>

      <button onClick={voteForCandidate} className="mt-4 px-4 py-2 bg-green-500 text-white rounded w-full">Votar</button>

      <div className="mt-6">
        <h3 className="text-xl font-bold">Crear Elección</h3>
        <label className="block text-gray-700 font-semibold">Candidatos (separados por coma)</label>
        <input type="text" value={newCandidates} onChange={(e) => setNewCandidates(e.target.value)} className="border p-2 w-full rounded" />
        <label className="block text-gray-700 font-semibold">Duración (minutos)</label>
        <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="border p-2 w-full rounded" />
        <button onClick={createElection} className="mt-4 px-4 py-2 bg-red-500 text-white rounded w-full">Crear Elección</button>
      </div>
    </div>
  );
};

export default VotingComponent;
