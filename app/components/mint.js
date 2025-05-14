'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x6a8aC10e3be71F2E096314825DB25A4b050CcEb2"; 
const ABI = [
    {
        "inputs": [],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalMinted",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
];

export default function MintNFT({ provider }) {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [totalMinted, setTotalMinted] = useState(0);

    useEffect(() => {
        if (provider) {
            const signer = provider.getSigner();
            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
            setContract(contractInstance);
            fetchTotalMinted(contractInstance);
        }
    }, [provider]);

    const fetchTotalMinted = async (contractInstance) => {
        if (!contractInstance) return;
        try {
            const minted = await contractInstance.totalMinted();
            setTotalMinted(minted.toNumber());
        } catch (error) {
            console.error("Error al obtener total de NFTs:", error);
        }
    };

    const mintNFT = async () => {
        if (!contract) return alert("Error: contrato no disponible");
        try {
            setLoading(true);
            setMessage("");
            const tx = await contract.mint();
            await tx.wait();
            setMessage("¡NFT minteado exitosamente!");
            fetchTotalMinted(contract);
        } catch (error) {
            console.error(error);
            setMessage("Error al mintear");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-md mx-auto rounded-lg p-4 shadow-lg border border-gray-300" style={{ backgroundColor: "var(--mint-bg)" }}>
            <h1 className="text-2xl font-bold mb-4 text-primary">Mintear NFT</h1>
            <button
                onClick={mintNFT}
                className="w-full bg-secondary text-white p-3 rounded-md shadow-md hover:shadow-lg transition-shadow"
                disabled={loading}
            >
                {loading ? "Minteando..." : "Mintear NFT"}
            </button>
            {message && <p className="mt-4 text-center text-red-500">{message}</p>}
            <p className="mt-4 text-center text-gray-600">NFTs minteados: {totalMinted} / 1000</p>
        </div>
    );
}
