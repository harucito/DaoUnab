"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { nftContractAddress, nftContractABI } from "./components/NftABI";
import VotingComponent from "./components/VotingComponent";
import MintNFT from "./components/mint"; // Componente para mintear el NFT

export default function VotingDapp() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [hasNFT, setHasNFT] = useState(false);
  const PASS_ID = 1; // ID del NFT

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(nftContractAddress, nftContractABI, signer);
        setContract(contract);
      } else {
        console.log("MetaMask no está instalado.");
      }
    }
    loadBlockchainData();
  }, []);

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
    checkNFTBalance(accounts[0]); // Verificar si el usuario tiene el NFT
  }

  async function checkNFTBalance(userAddress) {
    if (!contract) return;
    try {
      const balance = await contract.balanceOf(userAddress, PASS_ID);
      setHasNFT(balance.gt(0)); // Si tiene al menos 1 NFT, puede votar
    } catch (error) {
      console.error("Error verificando NFT:", error);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">DApp de Votación</h1>

      {!account ? (
        <button onClick={connectWallet} className="px-4 py-2 bg-blue-500 text-white rounded">
          Conectar Wallet
        </button>
      ) : (
        <>
          <p>Conectado: {account}</p>

          {hasNFT ? (
            // Si el usuario tiene el NFT, muestra la votación
            <VotingComponent />
          ) : (
            // Si NO tiene el NFT, muestra la opción de mintear
            <MintNFT contract={contract} account={account} />
          )}
        </>
      )}
    </div>
  );
}
