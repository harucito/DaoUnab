"use client";
import { useState } from "react";

export default function AdminPanel({ contract, owner, account, startElection }) {
  const MAX_CANDIDATES = 12;
  const [newElectionCategory, setNewElectionCategory] = useState("");
  const [candidates, setCandidates] = useState([""]); 
  const [imageFiles, setImageFiles] = useState(Array(MAX_CANDIDATES).fill(null)); 
  const [duration, setDuration] = useState("");
  const [loadingElection, setLoadingElection] = useState(false);

  if (account !== owner) return null;

  const addCandidate = () => {
    if (candidates.length < MAX_CANDIDATES) {
      setCandidates([...candidates, ""]);
    }
  };

  const handleCandidateChange = (index, value) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index] = value;
    setCandidates(updatedCandidates);
  };

  const handleImageChange = (index, file) => {
    const updatedImages = [...imageFiles];
    updatedImages[index] = file;
    setImageFiles(updatedImages);
  };

  const uploadImagesToPinata = async () => {
    const uploadedCIDs = [];

    for (let i = 0; i < candidates.length; i++) {
      const file = imageFiles[i];

      if (!file) {
        console.error(`❌ Falta imagen para el candidato ${candidates[i]}`);
        alert(`Falta imagen para el candidato ${candidates[i]}`);
        return null;
      }

      console.log(`📤 Subiendo imagen de ${candidates[i]}...`);
      const cid = await uploadToPinata(file);
      if (cid) {
        uploadedCIDs.push(cid);
      } else {
        return null;
      }
    }
    return uploadedCIDs;
  };

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3MjQxMTlhMi0yMDA0LTRjZjEtYjczYi1lMTFmZGVhOTI0ZjIiLCJlbWFpbCI6ImpwaW5lZGEzNTdAdW5hYi5lZHUuY28iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYzhmMTcyZDcyNjUwNDA4OWQ3ZmUiLCJzY29wZWRLZXlTZWNyZXQiOiJkODcwMzNlYTNkYzJjNzBhZDFiYTk1OGNkMDY4NjY4ZDQwNzA4ZGFmMDNhOWQ5M2RhOWRlNjBlYzY0OTk3MzU1IiwiZXhwIjoxNzcyMDUxMzc2fQ.nlI33XdOgPGllDUyvdOsJ_gA3BprEcJ0G2GBtIAjr3M"}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log(`✅ Imagen subida a IPFS: ${data.IpfsHash}`);
      return data.IpfsHash;
    } catch (error) {
      console.error("❌ Error subiendo imagen a Pinata:", error);
      return null;
    }
  };

  const createElection = async () => {
    if (!newElectionCategory || candidates.some(c => c.trim() === "")) {
      alert("Todos los candidatos deben tener un nombre.");
      return;
    }

    setLoadingElection(true);

    console.log("📌 Candidatos antes de enviar:", candidates);
    console.log("📸 Imágenes antes de subir:", imageFiles);

    const imageCIDs = await uploadImagesToPinata();
    
    console.log("🖼 CIDs de imágenes recibidos:", imageCIDs);

    if (!imageCIDs || imageCIDs.length !== candidates.length) {
      alert("Error subiendo imágenes. Verifica que cada candidato tenga su imagen.");
      setLoadingElection(false);
      return;
    }

    try {
      await contract.startElection(newElectionCategory, candidates, imageCIDs, duration);
      alert("Elección creada exitosamente");
    } catch (error) {
      console.error("❌ Error al crear la elección:", error);
    }

    setLoadingElection(false);
  };

  return (
    <div className="mt-6 bg-gray-100 rounded-xl p-4">
      <h2 className="text-xl font-bold">Administración</h2>

      <h3 className="text-lg font-semibold">Crear Elección</h3>
      <input 
        type="text" 
        placeholder="Categoría" 
        value={newElectionCategory} 
        onChange={(e) => setNewElectionCategory(e.target.value)} 
        className="border p-2 w-full rounded mt-2"
      />

      {candidates.map((name, index) => (
        <div key={index} className="mt-2 flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Candidato ${index + 1}`}
            value={name}
            onChange={(e) => handleCandidateChange(index, e.target.value)}
            className="border p-2 w-1/2 rounded"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(index, e.target.files[0])}
            className="border p-2 w-1/2 rounded"
          />
        </div>
      ))}

      <button 
        onClick={addCandidate} 
        disabled={candidates.length >= MAX_CANDIDATES}
        className="mt-2 px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500"
      >
        Agregar Candidato
      </button>

      <input 
        type="number" 
        placeholder="Duración (min)" 
        value={duration} 
        onChange={(e) => setDuration(e.target.value)} 
        className="border p-2 w-full rounded mt-2"
      />

      <button 
        onClick={createElection} 
        className="mt-4 px-4 py-2 rounded w-full text-white bg-red-500 hover:bg-red-700 disabled:bg-gray-500"
        disabled={loadingElection}
      >
        {loadingElection ? "Procesando..." : "Iniciar Elección"}
      </button>
    </div>
  );
}
