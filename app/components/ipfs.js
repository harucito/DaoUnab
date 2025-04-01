import axios from "axios";

const PINATA_API_KEY = "c8f172d726504089d7fe";
const PINATA_SECRET_KEY = "d87033ea3dc2c70ad1ba958cd068668d40708daf03a9d93da9de60ec64997355";
const PINATA_URL = "https://olive-advisory-horse-630.mypinata.cloud/ipfs";

export async function uploadImageToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const pinataMetadata = JSON.stringify({ name: file.name });
  formData.append("pinataMetadata", pinataMetadata);

  const pinataOptions = JSON.stringify({ cidVersion: 1 });
  formData.append("pinataOptions", pinataOptions);

  try {
    const res = await axios.post(PINATA_URL, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_KEY
      }
    });

    return res.data.IpfsHash; 
  } catch (error) {
    console.error("Error subiendo imagen a IPFS:", error);
  }
}
