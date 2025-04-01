import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from './contractABI';

const RemainingTime = () => {
  const [category, setCategory] = useState("");
  const [remainingTime, setRemainingTime] = useState(null);
  const [status, setStatus] = useState("");

  const fetchRemainingTime = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const timeRemaining = await contract.getRemainingTime(category);
      const remainingTimeInSeconds = timeRemaining.toString(); // Convierte a cadena

      setRemainingTime(remainingTimeInSeconds);
    } catch (error) {
      console.error(error);
      setStatus("Error fetching remaining time.");
    }
  };

  return (
    <div>
      <h3>Remaining Voting Time</h3>
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <button onClick={fetchRemainingTime}>Get Remaining Time</button>
      {remainingTime !== null && <p>Remaining Time: {remainingTime} seconds</p>}
      <p>{status}</p>
    </div>
  );
};

export default RemainingTime;
