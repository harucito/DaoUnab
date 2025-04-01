import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './contractABI';

const Xxx = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [category, setCategory] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(null);
  const [winner, setWinner] = useState('');
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);
        const signer = tempProvider.getSigner();
        setContract(new ethers.Contract(contractAddress, contractABI, signer));
      }
    };
    initProvider();
  }, []);

  // Función para votar
  const voteForCandidate = async () => {
    if (selectedCandidateIndex === null || !contract) return;
    
    try {
      const tx = await contract.vote(category, selectedCandidateIndex);
      await tx.wait();
      alert('Voto registrado con éxito');
      
      // Actualizar automáticamente el tiempo restante y los candidatos
      fetchCandidates();
      fetchRemainingTime();
    } catch (error) {
      console.error('Error al votar:', error);
    }
  };

  // Función para obtener los candidatos y sus votos
  const fetchCandidates = async () => {
    try {
      if (!contract || !category) return;
      
      // Obtener el ID de la última elección activa
      const electionId = await contract.latestElectionId(category);
      const result = await contract.getAllVotesOfCandidates(category, electionId);
      const formattedCandidates = result.map((c) => ({
        name: c.name,
        votes: c.voteCount.toNumber(),
      }));
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
    }
  };

  // Función para obtener el ganador
  const fetchWinner = async () => {
    try {
      if (!contract || !category) return;
      
      // Obtener el ID de la última elección activa
      const electionId = await contract.latestElectionId(category);
      const result = await contract.getElectionWinner(category, electionId);
      setWinner(result);
    } catch (error) {
      console.error('Error al obtener el ganador:', error);
    }
  };

  // Función para obtener el tiempo restante
  const fetchRemainingTime = async () => {
    try {
      if (!contract || !category) return;
      
      // Obtener el ID de la última elección activa
      const electionId = await contract.latestElectionId(category);
      const result = await contract.getRemainingTime(category);
      setRemainingTime(result.toNumber());
    } catch (error) {
      console.error('Error al obtener el tiempo restante:', error);
    }
  };

  // Actualizar los candidatos y el tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCandidates();
      fetchRemainingTime();
    }, 1000); // 1 segundo

    // Limpiar intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [category]);

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h1 className="text-xl font-bold mb-4">Sistema de Votación</h1>

      <div className="mb-2">
        <input
          type="text"
          placeholder="Categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <p className="font-semibold">Candidatos:</p>
        <ul>
          {candidates.map((c, index) => (
            <li
              key={index}
              className="p-2 bg-white shadow-md rounded-md mb-2 cursor-pointer"
              onClick={() => setSelectedCandidateIndex(index)}
              style={{
                backgroundColor:
                  selectedCandidateIndex === index ? 'lightblue' : 'white',
              }}
            >
              {c.name} - Votos: {c.votes}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={voteForCandidate}
        className="bg-blue-500 text-white p-2 rounded-md w-full"
      >
        Votar
      </button>

      {remainingTime !== null && (
        <p className="mt-2">Tiempo restante: {remainingTime} segundos</p>
      )}

      {winner && <p className="mt-2">Ganador: {winner}</p>}
    </div>
  );
};

export default Xxx;


