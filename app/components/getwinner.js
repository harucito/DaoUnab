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

export default function GetElectionWinner() {
	const [category, setCategory] = useState("");
	const [electionId, setElectionId] = useState("");
	const [winner, setWinner] = useState(null);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [loading, setLoading] = useState(false);

	async function fetchWinner() {
		if (!window.ethereum) return alert("Instala MetaMask");
		setLoading(true);
		setWinner(null);
		setStartDate(null);
		setEndDate(null);

		try {
			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

			const id = parseInt(electionId);
			if (isNaN(id) || id < 1) {
				alert("El ID de elección debe ser un número válido mayor a 0.");
				setLoading(false);
				return;
			}

			const result = await contract.getElectionById(category, id);

			// Calcular el índice del ganador basado en el mayor número de votos
			const maxVotesIndex = result.candidateVotes.reduce(
				(maxIndex, currentVotes, currentIndex, votesArray) =>
					currentVotes > votesArray[maxIndex] ? currentIndex : maxIndex,
				0
			);

			setWinner(result.candidateNames[maxVotesIndex]);
			setStartDate(new Date(Number(result.votingStart) * 1000).toLocaleString());
			setEndDate(new Date(Number(result.votingEnd) * 1000).toLocaleString());
		} catch (error) {
			console.error("Error obteniendo el ganador:", error);
			alert("Error al consultar el ganador. Revisa la categoría y el ID.");
		}

		setLoading(false);
	}

	return (
		<div className="card max-w-md mx-auto rounded-lg p-4 shadow-lg border border-gray-300" style={{ backgroundColor: "var(--results-bg)" }}>
			<h2 className="text-2xl font-bold mb-4 text-primary">Consultar Ganador de Elección</h2>
			<input
				type="text"
				placeholder="Categoría"
				value={category}
				onChange={(e) => setCategory(e.target.value)}
				className="w-full p-3 border border-gray-400 rounded-md mb-4 bg-neutral focus:outline-none focus:ring-2 focus:ring-primary"
			/>
			<input
				type="number"
				placeholder="ID de la Elección"
				value={electionId}
				onChange={(e) => setElectionId(e.target.value)}
				className="w-full p-3 border border-gray-400 rounded-md mb-4 bg-neutral focus:outline-none focus:ring-2 focus:ring-primary"
			/>
			<button
				onClick={fetchWinner}
				className="w-full bg-primary text-white p-3 rounded-md shadow-md hover:bg-buttonHover transition-shadow"
				disabled={loading}
			>
				{loading ? "Cargando..." : "Consultar"}
			</button>
			{startDate && endDate && (
				<div className="flex justify-between mt-6">
					<p><strong>Inicio:</strong> {startDate}</p>
					<p><strong>Fin:</strong> {endDate}</p>
				</div>
			)}
			{winner && (
				<div className="mt-6 text-center">
					<p className="text-2xl font-bold text-red-500">El ganador es: {winner}</p>
				</div>
			)}
		</div>
	);
}