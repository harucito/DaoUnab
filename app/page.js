"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractAddress, contractABI } from "./components/contractABI";
import { nftContractAddress, nftContractABI } from "./components/NftABI";
import VotingComponent from "./components/VotingComponent";
import ShowWinner from "./components/showresults";
import RemainingTime from "./components/timeremaining";
import AllVotes from "./components/allvotes";
import Xxx from "./components/estesies.js";
import ElectionInfo from "./components/getElection";
import GetElectionById from "./components/GetElectionById";
import AdminPanel from "./components/admin";
import MintNFT from "./components/mint"; // Componente para mintear el NFT
import GetWinner from "./components/getwinner";

export default function VotingDapp() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loadingElection, setLoadingElection] = useState(false);
  const [mintcontract, setMintContract] = useState(null);
  const [hasNFT, setHasNFT] = useState(false);
  const [loadingNFT, setLoadingNFT] = useState(true); // Estado para mostrar "cargando..."
  const PASS_ID = 1; // ID del NFT

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contract);
        const contractMint = new ethers.Contract(nftContractAddress, nftContractABI, signer);
        setMintContract(contractMint);
        
        // Obtener el owner del contrato
        const contractOwner = await contract.owner();
        setOwner(contractOwner.toLowerCase());
      } else {
        console.log("MetaMask no está instalado.");
      }
    }
    loadBlockchainData();
  }, []);

  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  }

  async function checkNFTBalance(userAddress) {
    if (!mintcontract) return;
    setLoadingNFT(true); // Mostrar cargando mientras se consulta el NFT
    try {
      const balance = await mintcontract.balanceOf(userAddress, PASS_ID);
      setHasNFT(balance.gt(0)); // Si tiene al menos 1 NFT, puede votar
    } catch (error) {
      console.error("Error verificando NFT:", error);
    } finally {
      setLoadingNFT(false); // Ocultar cargando después de la consulta
    }
  }

  // Verifica el NFT cada vez que cambia la cuenta
  
  useEffect(() => {
    if (account) {
      checkNFTBalance(account);
    }
  }, [account, mintcontract]);

  async function fetchElectionWinner(category, electionId) {
    if (!contract || !category || !electionId) return;
    try {
      setLoadingElection(true);
      console.log("Obteniendo ganador para", category, electionId);
      const result = await contract.getElectionWinner(category, parseInt(electionId));
      console.log("Ganador obtenido:", result);




























































































































































































































































































































































































































































































































































































































































































































































































































































































































































































      
    } catch (error) {
      console.error("Error al obtener ganador:", error);
    } finally {
      setLoadingElection(false);
    }
  }

  async function startElection(category, candidates, duration) {
    if (!contract || !category || !candidates || !duration) return;
    try {
      setLoadingElection(true);
      console.log("Iniciando elección con datos:", category, candidates, duration);
      const tx = await contract.startElection(category, candidates.split(","), parseInt(duration));
      await tx.wait();
      alert("Elección creada con éxito");
    } catch (error) {
      console.error("Error al iniciar elección:", error);
    } finally {
      setLoadingElection(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">DApp de Votación</h1>
      {account && <p>Conectado: {account}</p>}

      {!account ? (
        <button onClick={connectWallet} className="px-4 py-2 bg-blue-500 text-white rounded">
          Conectar Wallet
        </button>
      ) : (
        <>  
          {/* Si el usuario no tiene el NFT, mostrar botón para mintearlo */}
          {loadingNFT ? (
            <p className="text-yellow-500">Verificando si tienes el NFT...</p>
          ) : !hasNFT ? (
            <div className="my-4">
              <p className="text-red-500">No tienes el NFT necesario para votar.</p>
              <MintNFT provider={provider} />
            </div>
          ) : (
            <p className="text-green-500">Tienes el NFT, puedes votar.</p>
          )}

          {/* Panel de administración, solo visible para el dueño */}
          {account === owner && (
            <div>
              <AdminPanel
                contract={contract}
                owner={owner}
                account={account}
                startElection={startElection}
                fetchElectionWinner={fetchElectionWinner}
              />
              <GetWinner></GetWinner>
              <ElectionInfo />
              <GetElectionById />
            </div>
          )}

          {/* Sección de votación (solo aparece si el usuario tiene el NFT) */}
          {hasNFT && <Xxx />}
        </>
      )}
    </div>
  );
}
