import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './contractABI';

const VotingComponent = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [category, setCategory] = useState('');
  const [candidateIndex, setCandidateIndex] = useState('');
  const [electionId, setElectionId] = useState('');
  const [candidates, setCandidates] = useState([]);
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

  const voteForCandidate = async () => {
    try {
      if (!contract) return;
      const tx = await contract.vote(category, candidateIndex);
      await tx.wait();
      alert('Voto registrado con éxito');
    } catch (error) {
      console.error('Error al votar:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      if (!contract) return;
      const result = await contract.getAllVotesOfCandidates(category, electionId);
      const formattedCandidates = result.map(c => ({ name: c.name, votes: c.voteCount.toNumber() }));
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
    }
  };

  const fetchWinner = async () => {
    try {
      if (!contract) return;
      const result = await contract.getElectionWinner(category, electionId);
      setWinner(result);
    } catch (error) {
      console.error('Error al obtener el ganador:', error);
    }
  };

  const fetchRemainingTime = async () => {
    try {
      if (!contract) return;
      const result = await contract.getRemainingTime(category);
      setRemainingTime(result.toNumber());
    } catch (error) {
      console.error('Error al obtener el tiempo restante:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h1 className="text-xl font-bold mb-4">Sistema de Votación</h1>
      <div className="mb-2">
        <input type="text" placeholder="Categoría" value={category} onChange={e => setCategory(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <div className="mb-2">
        <input type="number" placeholder="ID Elección" value={electionId} onChange={e => setElectionId(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <div className="mb-2">
        <input type="number" placeholder="Índice del Candidato" value={candidateIndex} onChange={e => setCandidateIndex(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <button onClick={voteForCandidate} className="bg-blue-500 text-white p-2 rounded-md w-full">Votar</button>
      <button onClick={fetchCandidates} className="bg-green-500 text-white p-2 rounded-md w-full mt-2">Obtener Candidatos</button>
      <button onClick={fetchWinner} className="bg-yellow-500 text-white p-2 rounded-md w-full mt-2">Obtener Ganador</button>
      <button onClick={fetchRemainingTime} className="bg-red-500 text-white p-2 rounded-md w-full mt-2">Tiempo Restante</button>
      {remainingTime !== null && <p>Tiempo restante: {remainingTime} segundos</p>}
      {winner && <p>Ganador: {winner}</p>}
      <ul className="mt-2">
        {candidates.map((c, index) => (
          <li key={index} className="p-2 bg-white shadow-md rounded-md mb-2">{c.name} - Votos: {c.votes}</li>
        ))}
      </ul>
    </div>
  );
};

export default VotingComponent;
