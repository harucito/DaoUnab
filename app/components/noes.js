import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './contractABI';

const Xxx = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [candidateIndex, setCandidateIndex] = useState(null);
  const [electionId] = useState(1); // ID de la elección, se mantiene constante en este ejemplo

  const [categories] = useState(['Rector', 'Representante estudiantil', 'Representante profesores', 'yo', 'tu']);
  const [candidates, setCandidates] = useState([]);
  const [winner, setWinner] = useState('');
  const [remainingTime, setRemainingTime] = useState(null);
  const [voted, setVoted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);
        const signer = tempProvider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
        setContract(new ethers.Contract(contractAddress, contractABI, signer));
      }
    };
    initProvider();
  }, []);

  useEffect(() => {
    if (contract && selectedCategory) {
      fetchCandidates();
      fetchRemainingTime();
      checkIfUserHasVoted();
    }
  }, [contract, selectedCategory]);

  const checkIfUserHasVoted = async () => {
    try {
      if (!contract || !userAddress || !selectedCategory) return;
      const electionId = await contract.latestElectionId(selectedCategory);
      if (electionId > 0) {
        const hasVoted = await contract.hasUserVoted(selectedCategory, electionId+1, userAddress);
        setVoted(hasVoted);
      }
    } catch (error) {
      console.error('Error verificando si el usuario ha votado:', error);
    }
  };

  const voteForCandidate = async () => {
    try {
      if (!contract || candidateIndex === null) return;
      const tx = await contract.vote(selectedCategory, candidateIndex);
      await tx.wait();
      alert('Voto registrado con éxito');
      setVoted(true);
      setErrorMessage('');
    } catch (error) {
      console.error('Error al votar:', error);
      if (error.message.includes('You have already voted')) {
        setErrorMessage('No puedes votar porque ya has votado.');
      } else {
        setErrorMessage('Ocurrió un error desconocido al votar.');
      }
    }
  };

  const fetchCandidates = async () => {
    try {
      if (!contract || !selectedCategory || !electionId) return;
      const result = await contract.getAllVotesOfCandidates(selectedCategory, electionId+1);
      const formattedCandidates = result.map((c, index) => ({ name: c.name, votes: c.voteCount.toNumber(), index }));
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
    }
  };

  const fetchRemainingTime = async () => {
    try {
      if (!contract || !selectedCategory) return;
      const result = await contract.getRemainingTime(selectedCategory);
      setRemainingTime(result.toNumber());
    } catch (error) {
      console.error('Error al obtener el tiempo restante:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h1 className="text-xl font-bold mb-4">Sistema de Votación</h1>

      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Selecciona una Categoría:</label>
        <select
          id="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        >
          {categories.map((category, index) => (
            <option key={index} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <ul className="mt-2">
        {candidates.map((c) => (
          <li key={c.index} className="p-2 bg-white shadow-md rounded-md mb-2">
            <button
              className={`w-full text-left p-3 rounded-md ${candidateIndex === c.index ? 'bg-blue-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
              onClick={() => setCandidateIndex(c.index)}
            >
              {c.name} - Votos: {c.votes}
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={voteForCandidate}
        className={`w-full p-2 rounded-md ${voted || remainingTime === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
        disabled={voted || remainingTime === 0}
      >
        {voted ? 'Gracias por su voto' : 'Votar'}
      </button>

      {remainingTime !== null && <p className="mt-2">Tiempo restante: {remainingTime} segundos</p>}
      {winner && <p className="mt-2">Ganador: {winner}</p>}
      {errorMessage && <p className="mt-2 text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default Xxx;
