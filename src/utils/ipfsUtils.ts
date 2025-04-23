
// Get Pinata credentials from localStorage
const getPinataCredentials = () => {
  const apiKey = localStorage.getItem('PINATA_API_KEY');
  const apiSecret = localStorage.getItem('PINATA_API_SECRET');
  
  if (!apiKey || !apiSecret) {
    throw new Error('Pinata credentials not found. Please set up your API keys first.');
  }
  
  return { apiKey, apiSecret };
};

// Upload a file to Pinata
export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const { apiKey, apiSecret } = getPinataCredentials();
    const endpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Pinata upload failed: " + errorText);
    }
    const result = await response.json();
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

// Unpin (delete) a file from Pinata by IPFS hash
export const unpinFromIPFS = async (ipfsHash: string): Promise<void> => {
  try {
    const { apiKey, apiSecret } = getPinataCredentials();
    const endpoint = `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`;
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: apiSecret,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error("Failed to unpin from Pinata: " + errText);
    }
  } catch (error) {
    console.error("Error unpinning from Pinata:", error);
    throw error;
  }
};

// Check if Pinata credentials are set
export const arePinataCredentialsSet = (): boolean => {
  const apiKey = localStorage.getItem('PINATA_API_KEY');
  const apiSecret = localStorage.getItem('PINATA_API_SECRET');
  return Boolean(apiKey && apiSecret);
};

// Save Pinata credentials to localStorage
export const savePinataCredentials = (apiKey: string, apiSecret: string, gateway?: string): void => {
  localStorage.setItem('PINATA_API_KEY', apiKey);
  localStorage.setItem('PINATA_API_SECRET', apiSecret);
  
  // Optionally save gateway if provided
  if (gateway) {
    localStorage.setItem('PINATA_GATEWAY', gateway);
  }
};
