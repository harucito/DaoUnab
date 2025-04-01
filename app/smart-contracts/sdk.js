import { ThirdwebSDK } from "@thirdweb-dev/sdk";
//import dotenv from "dotenv";

//dotenv.config();
const PRIVATE_KEY="a76d1cd562ae8b8fde6ecf19c5805e59e77c52aca464365111afa68eec1c95ea"
const QUICKNODE_API_URL="https://responsive-boldest-haze.ethereum-sepolia.quiknode.pro/a8aa2034a8385d9d78ddccd46942932c66b1a311"
const WALLET_ADDRESS="0x6Efb6B2acc50A2E3c2245dB2E70429513b05a188"

//const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;
//const QUICKNODE_API_URL = process.env.NEXT_PUBLIC_QUICKNODE_API_URL;
//const WALLET_ADDRESS = process.env.NEXT_PUBLIC_WALLET_ADDRESS;

if (!PRIVATE_KEY || PRIVATE_KEY === "") {
  console.log("🛑 Private key not found.");
}

if (!QUICKNODE_API_URL || QUICKNODE_API_URL === "") {
  console.log("🛑 QuickNode API URL not found.");
}

if (!WALLET_ADDRESS || WALLET_ADDRESS === "") {
  console.log("🛑 Wallet Address not found.");
}

const sdk = ThirdwebSDK.fromPrivateKey(
  PRIVATE_KEY,
  QUICKNODE_API_URL
);

(async () => {
  try {
    const address = await sdk.getSigner().getAddress();
    console.log("👋 SDK initialized by address:", address)
  } catch (err) {
    console.error("Failed to get apps from the sdk", err);
    process.exit(1);
  }
})();

export default sdk;