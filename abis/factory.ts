export const factoryABI = [
  {
    inputs: [],
    name: "DeployedError",
    type: "error",
  },
  {
    inputs: [],
    name: "SameTokenError",
    type: "error",
  },
  {
    inputs: [],
    name: "ScaleError",
    type: "error",
  },
  {
    inputs: [],
    name: "ZeroAddressError",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "token0Exp",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "token1Exp",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "upperBound",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "lendgine",
        type: "address",
      },
    ],
    name: "LendgineCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        internalType: "uint8",
        name: "token0Exp",
        type: "uint8",
      },
      {
        internalType: "uint8",
        name: "token1Exp",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "upperBound",
        type: "uint256",
      },
    ],
    name: "createLendgine",
    outputs: [
      {
        internalType: "address",
        name: "lendgine",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "getLendgine",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "parameters",
    outputs: [
      {
        internalType: "address",
        name: "token0",
        type: "address",
      },
      {
        internalType: "address",
        name: "token1",
        type: "address",
      },
      {
        internalType: "uint128",
        name: "token0Exp",
        type: "uint128",
      },
      {
        internalType: "uint128",
        name: "token1Exp",
        type: "uint128",
      },
      {
        internalType: "uint256",
        name: "upperBound",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
