import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxMTc1YTA4MC05MDUxLTQxMDAtOWE2MC1jMDM4YTMyYmZmMzQiLCJlbWFpbCI6InNlZ3VuemFjaGV1c2lAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImJmZjRkYzkwZTJjZmNjNThhOTc1Iiwic2NvcGVkS2V5U2VjcmV0IjoiMzU1ZTM0NTIyOTgzOTEyNDM4OTQ2ZGI5ZDQ2NDcxNzgzNDNmYTcwOGI0ZTk3ZGU5NDNiYjA3YWQ1MDI1ZDk3ZCIsImV4cCI6MTc4NjQ2ODE2MX0.Z8-dQQk1nvzpHvee7AS7jd31TACjQ8dhJ56QO1wezbc",
  pinataGateway: import.meta.env.VITE_PINATA_GATEWAY,
});

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    const result = await pinata.upload.file(file);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

export const getIPFSUrl = (hash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};