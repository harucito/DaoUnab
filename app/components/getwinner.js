import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x2C0477146629b58bf7824247BE6FA1D8A4C34cd4";

const ABI = [
  {
    "constant": true,
    "inputs": [
      { "name": "_category", "type": "string" },
      { "name": "_electionId", "type": "uint256" }
    ],
    "name": "getElectionWinner",
    "outputs": [{ "name": "winner", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function GetElectionWinner() {
  const [category, setCategory] = useState("");
  const [electionId, setElectionId] = useState("");
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchWinner() {
    if (!window.ethereum) return alert("Instala MetaMask");
    setLoading(true);
    setWinner(null);

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      
      const id = parseInt(electionId);
      if (isNaN(id) || id < 1) {
        alert("El ID de elección debe ser un número válido mayor a 0.");
        setLoading(false);
        return;
      }

      const result = await contract.getElectionWinner(category, id);
      
      setWinner(result);
    } catch (error) {
      console.error("Error obteniendo el ganador:", error);
      alert("Error al consultar el ganador. Revisa la categoría y el ID.");
    }

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-xl font-bold">Consultar Ganador de Elección</h2>
      <input
        type="text"
        placeholder="Categoría"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded mt-2"
      />
      <input
        type="number"
        placeholder="ID de la Elección"
        value={electionId}
        onChange={(e) => setElectionId(e.target.value)}
        className="w-full p-2 border rounded mt-2"
      />
      <button
        onClick={fetchWinner}
        className="w-full bg-blue-500 text-white p-2 rounded mt-2"
        disabled={loading}
      >
        {loading ? "Cargando..." : "Consultar"}
      </button>
      {winner && (
        <div className="mt-4 border-t pt-2">
          <p><strong>Ganador:</strong> {winner}</p>
        </div>
      )}
    </div>
  );
}