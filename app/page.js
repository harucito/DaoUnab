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
import MintNFT from "./components/mint";
import GetWinner from "./components/getwinner";
import { FaSun, FaMoon } from "react-icons/fa"; // Ensure this import is correct

export default function VotingDapp() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loadingElection, setLoadingElection] = useState(false);
  const [mintcontract, setMintContract] = useState(null);
  const [hasNFT, setHasNFT] = useState(false);
  const [loadingNFT, setLoadingNFT] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Estado para el modo oscuro
  const [universityCode, setUniversityCode] = useState("");
  const PASS_ID = 1;

  const isUniversityCodeValid = (code) => /^U00\d{6}$/.test(code); // Validate format U00XXXXXX

  useEffect(() => {
    async function loadBlockchainData() {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(provider);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        const contractMint = new ethers.Contract(nftContractAddress, nftContractABI, signer);

        setContract(contract);
        setMintContract(contractMint);

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
    setLoadingNFT(true);
    try {
      const balance = await mintcontract.balanceOf(userAddress, PASS_ID);
      setHasNFT(balance.gt(0));
    } catch (error) {
      console.error("Error verificando NFT:", error);
    } finally {
      setLoadingNFT(false);
    }
  }

  useEffect(() => {
    if (account) {
      checkNFTBalance(account);
    }
  }, [account, mintcontract]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  async function fetchElectionWinner(category, electionId) {
    if (!contract || !category || !electionId) return;
    try {
      setLoadingElection(true);
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
    <div className={`min-h-screen p-6 transition-colors duration-300 ${darkMode ? "bg-backgroundDark text-foregroundDark" : "bg-backgroundLight text-foregroundLight"}`}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex items-center justify-center bg-primary hover:bg-buttonHover text-white font-medium py-2 px-4 rounded"
        >
          {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-400" />}
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center">Dapp de votación estudiantil</h1>

        {!account ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full max-w-md">
              <label htmlFor="universityCode" className="block text-sm font-medium mb-2">
                Ingrese Código Universitario
              </label>
              <input
                id="universityCode"
                type="text"
                value={universityCode}
                onChange={(e) => setUniversityCode(e.target.value)}
                placeholder="U00XXXXXX"
                className="w-full p-3 border rounded-md bg-neutral focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={connectWallet}
              disabled={!isUniversityCodeValid(universityCode)}
              className={`w-full max-w-md bg-primary text-white py-2 px-4 rounded ${
                isUniversityCodeValid(universityCode) ? "hover:bg-buttonHover" : "opacity-50 cursor-not-allowed"
              }`}
            >
              Conectar Wallet
            </button>
          </div>
        ) : (
          <>
            <p className="text-center">Conectado: {account}</p>
            <p className="text-center">Código Universitario: {universityCode}</p>

            {/* Verificación de NFT */}
            <div className={`rounded-lg p-4 shadow-lg border border-gray-300 ${darkMode ? "bg-cardDark" : "bg-cardLight"}`}>
              {loadingNFT ? (
                <p className="text-yellow-400 text-center">Verificando si tienes el NFT...</p>
              ) : !hasNFT ? (
                <div className="text-center">
                  <p className="text-red-400">No tienes el NFT necesario para votar.</p>
                  <MintNFT provider={provider} />
                </div>
              ) : (
                <p className="text-green-400 text-center">Tienes el NFT, puedes votar.</p>
              )}
            </div>

            {/* Main section: Admin panel and voting system side by side */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Admin Panel */}
              {account === owner && (
                <div className={`flex-1 rounded-lg p-4 shadow-lg border border-gray-300 ${darkMode ? "bg-cardDark" : "bg-cardLight"}`}>
                  <AdminPanel
                    contract={contract}
                    owner={owner}
                    account={account}
                    startElection={startElection}
                    fetchElectionWinner={fetchElectionWinner}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <GetWinner />
                    <ElectionInfo darkMode={darkMode} />
                    <GetElectionById darkMode={darkMode} />
                  </div>
                </div>
              )}

              {/* Voting System */}
              {hasNFT && (
                <div className={`flex-1 rounded-lg p-4 shadow-lg border border-gray-300 ${darkMode ? "bg-cardDark" : "bg-cardLight"}`}>
                  <Xxx />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}