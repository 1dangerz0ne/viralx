import { ethers } from 'ethers';

const ALCHEMY_BASE_URL = process.env.ALCHEMY_BASE_URL || '';
// Demo wallet (server-side signing, for production use a key vault!)
const PRIVATE_KEY = process.env.BC_DEPLOYER_KEY || '';

const provider = new ethers.JsonRpcProvider(ALCHEMY_BASE_URL);
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

const ERC20_SOURCE = `
pragma solidity ^0.8.19;
contract MemeToken {
  string public name = 'ViralX Meme Token';
  string public symbol = 'VXM';
  uint8 public decimals = 18;
  uint public totalSupply = 1_000_000_000 ether;
  mapping(address => uint) public balanceOf;
  event Transfer(address indexed from, address indexed to, uint value);
  constructor(address user) {
    balanceOf[msg.sender] = totalSupply * 9 / 10; // 90%
    balanceOf[user] = totalSupply / 10; // 10%
    emit Transfer(address(0), msg.sender, balanceOf[msg.sender]);
    emit Transfer(address(0), user, balanceOf[user]);
  }
  function transfer(address to, uint value) public returns (bool) {
    require(balanceOf[msg.sender] >= value, 'balance');
    balanceOf[msg.sender] -= value;
    balanceOf[to] += value;
    emit Transfer(msg.sender, to, value);
    return true;
  }
}`;

const ERC721_SOURCE = `
pragma solidity ^0.8.19;
contract ViralXNft {
  string public name = 'ViralX NFT';
  string public symbol = 'VXN';
  address public owner;
  uint public tokenCounter = 1;
  mapping(uint => string) public tokenURIs;
  mapping(uint => address) public ownerOf;
  event Transfer(address indexed from, address indexed to, uint indexed tokenId);
  constructor() { owner = msg.sender; }
  function mint(address to, string memory uri) public returns (uint) {
    require(msg.sender == owner, 'nope');
    uint id = tokenCounter++;
    ownerOf[id] = to;
    tokenURIs[id] = uri;
    emit Transfer(address(0), to, id);
    return id;
  }
}`;

export async function deployOnBaseSepolia(userAddress: string, imageUrl: string, thread: string): Promise<{tx: string, nft: string}> {
  if (!wallet) throw new Error('No deployer PK');
  // 1. Compile with ethers, deploy ERC20 and ERC721
  const solc = require('solc');
  const input = { language: 'Solidity', sources: { 'MemeToken.sol': { content: ERC20_SOURCE }, 'ViralXNft.sol': { content: ERC721_SOURCE } }, settings: { outputSelection: { '*': { '*': ['*'] } } } };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const eRC20 = output.contracts['MemeToken.sol'].MemeToken;
  const eRC721 = output.contracts['ViralXNft.sol'].ViralXNft;

  // Deploy ERC-20
  const ERC20Factory = new ethers.ContractFactory(eRC20.abi, eRC20.evm.bytecode.object, wallet);
  const tokenContract = await ERC20Factory.deploy(userAddress);
  await tokenContract.waitForDeployment();
  // Deploy ERC-721
  const ERC721Factory = new ethers.ContractFactory(eRC721.abi, eRC721.evm.bytecode.object, wallet);
  const nftContract = await ERC721Factory.deploy();
  await nftContract.waitForDeployment();
  // Mint NFT
  const metadata = {
    name: 'ViralX NFT',
    image: imageUrl,
    description: `NFT art generated for thread: ${thread}`,
    thread: thread,
  };
  const uri = 'data:application/json;base64,' + Buffer.from(JSON.stringify(metadata)).toString('base64');
  const tx = await nftContract.mint(userAddress, uri);
  const receipt = await tx.wait();
  // Find the tokenId minted (assume the first log)
  const log = receipt?.logs?.[0];
  // Return contract addresses
  return { tx: tokenContract.target, nft: nftContract.target };
}
