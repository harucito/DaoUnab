import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from './contractABI';

const ShowWinner = ( ) => {
  const [category, setCategory] = useState("");
  const [winner, setWinner] = useState("");
  const [status, setStatus] = useState("");

  const fetchWinner = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const electionId = await contract.latestElectionId(category);

      if (electionId > 0) {
        const winner = await contract.getElectionWinner(category, electionId);
        setWinner(winner);
      }
    } catch (error) {
      console.error(error);
      setStatus("Error fetching winner.");
    }
  };

  return (
    <div>
      <h3>Show Election Winner</h3>
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <button onClick={fetchWinner}>Get Winner</button>
      {winner && <p>Winner: {winner}</p>}
      <p>{status}</p>
    </div>
  );
};

export default ShowWinner;
