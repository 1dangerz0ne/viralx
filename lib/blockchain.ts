import { ethers } from "ethers";

import { abi as ERC20_ABI } from "@/constants/erc20";
import { abi as NFT_ABI } from "@/constants/nft";

export const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_BASE_URL);
export const deployer = new ethers.Wallet(process.env.BC_DEPLOYER_KEY!, provider);

export const deployToken = async (name: string, symbol: string) => {
  const factory = new ethers.ContractFactory(ERC20_ABI, ERC20_BYTECODE, deployer);
  const contract = await factory.deploy(name, symbol, ethers.parseEther("1000000"));
  await contract.waitForDeployment();
  return contract.getAddress();
};
