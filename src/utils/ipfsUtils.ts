
// IPFS utils using Pinata API for uploads
// ---------------------------------------------------------------------------
// IMPORTANT: Add your Pinata credentials to a .env file at the root of your project:
// VITE_PINATA_API_KEY=your_key_here
// VITE_PINATA_API_SECRET=your_secret_here
//
// Pinata Docs: https://docs.pinata.cloud/api-pinning/pin-file
//
// These VITE_ prefixed variables are automatically available to your Vite project via import.meta.env
// ---------------------------------------------------------------------------

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY as string;
const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET as string;

if (!PINATA_API_KEY || !PINATA_API_SECRET) {
  console.warn(
    "Pinata API key/secret missing. Please add VITE_PINATA_API_KEY and VITE_PINATA_API_SECRET in your .env file."
  );
}

// Upload a file to Pinata
export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const endpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          btoa(`${PINATA_API_KEY}:${PINATA_API_SECRET}`),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Pinata upload failed: " + errorText);
    }
    const result = await response.json();
    // Pinata returns IPFS hash under IpfsHash
    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw error;
  }
};

// Download blob from Pinata gateway
export const downloadFromIPFS = async (ipfsHash: string): Promise<Blob> => {
  try {
    const url = getIPFSGatewayURL(ipfsHash);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error downloading IPFS file");
    return await response.blob();
  } catch (error) {
    console.error("Error downloading file from IPFS:", error);
    throw error;
  }
};

// Returns a Pinata public gateway URL for the given IPFS hash
export const getIPFSGatewayURL = (ipfsHash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
};
