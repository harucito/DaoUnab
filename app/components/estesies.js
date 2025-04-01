import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './contractABI';

const categories = [
  "Rector", "Representante Estudiantil", "Consejo Académico", "Consejo Superior","yo","tu","tutu"
];

const Xxx = () => {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [category, setCategory] = useState(""); 
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(null);
  const [winner, setWinner] = useState('');
  const [remainingTime, setRemainingTime] = useState(null);
  const [HasUserVoted, setHasUserVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    const initProvider = async () => {
      if (window.ethereum) {
        const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(tempProvider);
        const signer = tempProvider.getSigner();
        setContract(new ethers.Contract(contractAddress, contractABI, signer));

        const address = await signer.getAddress();
        setUserAddress(address);
      }
    };
    initProvider();
  }, []);

  const voteForCandidate = async () => {
    if (selectedCandidateIndex === null || !contract || !category || isVoting) return;

    if (remainingTime === 0) {
      alert("La votación ha finalizado, ya no puedes votar.");
      return;
    }

    try {
      setIsVoting(true);
      const tx = await contract.vote(category, selectedCandidateIndex);
      await tx.wait();

      alert('Voto registrado con éxito');

      setHasUserVoted(true);
      setSelectedCandidateIndex(null);
      fetchCandidates();
      fetchRemainingTime();
    } catch (error) {
      console.error('Error al votar:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const fetchCandidates = async () => {
    if (!contract || !category) return;
    try {
      const electionId = await contract.latestElectionId(category);
      const result = await contract.getAllVotesOfCandidates(category, electionId);
      const formattedCandidates = result.map((c, index) => ({
        name: c.name,
        votes: c.voteCount.toNumber(),
        imageCID: c.imageCID, 
        index
      }));
      setCandidates(formattedCandidates);
    } catch (error) {
      console.error('Error al obtener candidatos:', error);
    }
  };

  const fetchWinner = async () => {
    if (!contract || !category) return;
    try {
      const electionId = await contract.latestElectionId(category);
      const result = await contract.getElectionWinner(category, electionId);
      setWinner(result);
    } catch (error) {
      console.error('Error al obtener el ganador:', error);
    }
  };

  const fetchRemainingTime = async () => {
    if (!contract || !category) return;
    try {
      const result = await contract.getRemainingTime(category);
      const timeLeft = result.toNumber();
      setRemainingTime(timeLeft);

      if (timeLeft === 0) {
        setHasUserVoted(true);
        setSelectedCandidateIndex(null);
        fetchWinner();
      }
    } catch (error) {
      console.error('Error al obtener el tiempo restante:', error);
    }
  };

  const checkIfUserHasVoted = async () => {
    if (!contract || !userAddress || !category) return;
    try {
      const voted = await contract.hasUserVoted(category, userAddress);
      setHasUserVoted(voted);

      if (voted) {
        setSelectedCandidateIndex(null);
      }
    } catch (error) {
      console.error('Error al verificar si el usuario ha votado:', error);
    }
  };

  useEffect(() => {
    if (!category) return;
    const interval = setInterval(() => {
      fetchCandidates();
      fetchRemainingTime();
      checkIfUserHasVoted();
    }, 1000);
    return () => clearInterval(interval);
  }, [category]);

  useEffect(() => {
    if (category && userAddress) {
      checkIfUserHasVoted();
    }
  }, [category, userAddress]);

  return (
    <div className="p-4 bg-gray-100 rounded-xl">
      <h1 className="text-xl font-bold mb-4">Sistema de Votación</h1>

      <div className="mb-2">
        <label className="font-semibold">Selecciona una categoría:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded-md w-full"
          disabled={isVoting}
        >
          <option value="">Selecciona una categoría...</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {category && (
        <>
          <div className="mb-4">
            <p className="font-semibold">Candidatos:</p>
            <ul className="grid grid-cols-2 gap-4">
              {candidates.map((c) => (
                <li
                  key={c.index}
                  className={`p-2 bg-white shadow-md rounded-md mb-2 flex flex-col items-center justify-center text-center ${
                    selectedCandidateIndex === c.index ? "bg-lightblue" : "cursor-pointer"
                  }`}
                  onClick={() => {
                    if (!HasUserVoted && remainingTime > 0 && !isVoting) {
                      setSelectedCandidateIndex(c.index);
                    }
                  }}
                  style={{
                    backgroundColor: selectedCandidateIndex === c.index ? 'lightblue' : 'white',
                    cursor: HasUserVoted || remainingTime === 0 || isVoting ? 'not-allowed' : 'pointer',
                    opacity: HasUserVoted || remainingTime === 0 || isVoting ? 0.6 : 1
                  }}
                >
                  <img 
                    src={`https://ipfs.io/ipfs/${c.imageCID}`} 
                    alt={c.name} 
                    className="w-32 h-32 object-cover rounded-full" 
                  />
                  <p className="mt-2 font-semibold">{c.name}</p>
                  <p>Votos: {c.votes}</p>
                </li>
              ))}
            </ul>
          </div>

          {HasUserVoted || remainingTime === 0 ? (
            <p className="text-green-600 font-semibold">
              {remainingTime === 0 ? "La votación ha finalizado" : "Ya has votado en esta elección"}
            </p>
          ) : (
            <button
              onClick={voteForCandidate}
              className={`mt-4 px-4 py-2 rounded w-full text-white ${
                isVoting ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"
              }`}
              disabled={isVoting}
            >
              {isVoting ? "Procesando voto..." : "Votar"}
            </button>
          )}

          {remainingTime !== null && (
            <p className="mt-2">Tiempo restante: {remainingTime} segundos</p>
          )}

          {winner && remainingTime === 0 && (
            <p className="mt-2 text-xl font-bold text-red-500">
               ¡El ganador es: {winner}!
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Xxx;
