import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from './contractABI';

const AllVotes = () => {
  const [category, setCategory] = useState("");
  const [electionId, setElectionId] = useState(""); 
  const [votes, setVotes] = useState([]);
  const [status, setStatus] = useState("");

  const fetchVotes = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      // Verificar si los valores de category y electionId están presentes
      if (!category || !electionId) {
        setStatus("Please enter both category and election ID.");
        return;
      }

      // Usamos category y electionId
      const candidates = await contract.getAllVotesOfCandidates(category, electionId);
      setVotes(candidates);
    } catch (error) {
      console.error(error);
      setStatus("Error fetching votes.");
    }
  };

  return (
    <div>
      <h3>All Votes of Candidates</h3>
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Election ID"
        value={electionId}
        onChange={(e) => setElectionId(e.target.value)}
        required
      />
      <button onClick={fetchVotes}>Get Votes</button>
      <ul>
        {votes.map((candidate, index) => (
          <li key={index}>
            {candidate.name}: {candidate.voteCount.toString()} votes 
          </li>
        ))}
      </ul>
      <p>{status}</p>
    </div>
  );
};

export default AllVotes;
