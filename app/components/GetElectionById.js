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
    "name": "getElectionById",
    "outputs": [
      { "name": "electionId", "type": "uint256" },
      { "name": "category", "type": "string" },
      { "name": "votingStart", "type": "uint256" },
      { "name": "votingEnd", "type": "uint256" },
      { "name": "candidateNames", "type": "string[]" },
      { "name": "candidateVotes", "type": "uint256[]" },
      { "name": "candidateImages", "type": "string[]" } 
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function GetElectionById({ darkMode }) {
  const [category, setCategory] = useState("");
  const [electionId, setElectionId] = useState("");
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchElectionById() {
    if (!window.ethereum) return alert("Instala MetaMask");
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
      const result = await contract.getElectionById(category, electionId);

      setElection({
        id: result[0].toString(),
        category: result[1],
        start: new Date(Number(result[2]) * 1000).toLocaleString(),
        end: new Date(Number(result[3]) * 1000).toLocaleString(),
        candidates: result[4].map((name, i) => ({
          name,
          votes: result[5][i].toString(),
          imageCID: result[6]?.[i] || "" 
        }))
      });
    } catch (error) {
      console.error("Error obteniendo elección por ID:", error);
    }
    setLoading(false);
  }

  return (
    <div className={`max-w-md mx-auto rounded-lg p-4 shadow-lg border border-gray-300 ${darkMode ? "bg-cardDark text-foregroundDark" : "bg-white text-foregroundLight"}`}>
      <h2 className="text-2xl font-bold mb-4 text-primary">Consultar Elección por ID</h2>
      <input
        type="text"
        placeholder="Categoría"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-3 border rounded-md mb-4 bg-neutral focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="number"
        placeholder="ID de la Elección"
        value={electionId}
        onChange={(e) => setElectionId(e.target.value)}
        className="w-full p-3 border rounded-md mb-4 bg-neutral focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        onClick={fetchElectionById}
        className="w-full bg-primary text-white p-3 rounded-md shadow-md hover:bg-buttonHover transition-shadow"
        disabled={loading}
      >
        {loading ? "Cargando..." : "Consultar"}
      </button>
      {election && (
        <div className="mt-6 border-t pt-4">
          <p><strong>ID:</strong> {election.id}</p>
          <p><strong>Categoría:</strong> {election.category}</p>
          <p><strong>Inicio:</strong> {election.start}</p>
          <p><strong>Fin:</strong> {election.end}</p>
          <h3 className="mt-4 font-bold text-lg">Candidatos:</h3>
          <ul className="space-y-4">
            {election.candidates.map((c, i) => (
              <li key={i} className="flex items-center gap-4">
                {c.imageCID && (
                  <img
                    src={`https://ipfs.io/ipfs/${c.imageCID}`}
                    alt={c.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                  />
                )}
                <span>{c.name} - {c.votes} votos</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
