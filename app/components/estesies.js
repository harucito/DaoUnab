import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { contractAddress, contractABI } from './contractABI';

const categories = [
  "Junta Directiva - Estudiantes", "Junta Directiva - Docentes", "Consejo Académico - Estudiantes", "Consejo Académico - Docentes","Consejo de Facultad - Estudiantes","Consejo de Facultad - Docentes","Comité Curricular de Programa - Estudiantes","Comité Curricular de Programa - Docentes","tutu","Pruebas"
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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
      const electionId = await contract.latestElectionId(category);
      const result = await contract.getElectionById(category, electionId);

      const timeLeft = Math.max(0, Math.floor((Number(result.votingEnd) * 1000 - Date.now()) / 1000));
      setRemainingTime(timeLeft);

      setStartDate(new Date(Number(result.votingStart) * 1000).toLocaleString());
      setEndDate(new Date(Number(result.votingEnd) * 1000).toLocaleString());

      if (timeLeft === 0) {
        setHasUserVoted(true);
        setSelectedCandidateIndex(null);
        fetchWinner();
      }
    } catch (error) {
      console.error('Error al obtener el tiempo restante o las fechas:', error);
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
    <div className="p-6 rounded-lg shadow-lg border border-gray-300" style={{ backgroundColor: "var(--voting-bg)" }}>
      <h1 className="text-3xl font-bold mb-6 text-center text-primary">Sistema de Votación</h1>

      <div className="mb-6">
        <label className="font-semibold block mb-2 text-lg">Selecciona una categoría:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-400 p-3 rounded-md w-full text-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
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
          <div className="mb-6">
            <p className="font-semibold mb-4 text-lg">Candidatos:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {candidates.map((c) => (
                <li
                  key={c.index}
                  className={`p-4 rounded-lg shadow-lg border border-gray-300 flex flex-col items-center justify-center text-center transition-transform transform ${
                    selectedCandidateIndex === c.index ? 'border-orange-500 scale-105' : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: "var(--candidate-bg)",
                    cursor: HasUserVoted || remainingTime === 0 || isVoting ? 'not-allowed' : 'pointer',
                    opacity: HasUserVoted || remainingTime === 0 || isVoting ? 0.6 : 1,
                  }}
                  onClick={() => {
                    if (!HasUserVoted && remainingTime > 0 && !isVoting) {
                      setSelectedCandidateIndex(c.index);
                    }
                  }}
                >
                  <img 
                    src={`https://ipfs.io/ipfs/${c.imageCID}`} 
                    alt={c.name} 
                    className="w-24 h-24 object-cover rounded-full mb-4 border-2 border-primary" 
                  />
                  <p className="font-semibold text-lg">{c.name}</p>
                  <p className="text-sm">Votos: {c.votes}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between mt-6">
            <p><strong>Inicio:</strong> {startDate}</p>
            <p><strong>Fin:</strong> {endDate}</p>
            <p><strong>Tiempo restante:</strong> {remainingTime} segundos</p>
          </div>

          {HasUserVoted || remainingTime === 0 ? (
            <p className="text-green-600 font-semibold text-center text-lg mt-4">
              {remainingTime === 0 ? "La votación ha finalizado" : "Ya has votado en esta elección"}
            </p>
          ) : (
            <button
              onClick={voteForCandidate}
              className="mt-4 px-6 py-3 rounded-lg w-full text-white text-lg bg-secondary shadow-md hover:shadow-lg transition-shadow"
              disabled={isVoting}
            >
              {isVoting ? "Procesando voto..." : "Votar"}
            </button>
          )}

          {winner && remainingTime === 0 && (
            <div className="mt-6 text-center">
              <p className="text-2xl font-bold text-red-500">El ganador es: {winner}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Xxx;
