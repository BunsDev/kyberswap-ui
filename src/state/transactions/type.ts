export interface SerializableTransactionReceipt {
  blockHash: string
  status?: number
}

export interface TransactionDetails {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  type?: TRANSACTION_TYPE
  summary?: string
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  to?: string
  data?: string
  nonce?: number
  sentAtBlock?: number
  arbitrary: any // To store anything arbitrary, so it has any type
  needCheckSubgraph?: boolean
}

export interface GroupedTxsByHash {
  [firstTxHash: string]: TransactionDetails[] | undefined
}

export enum TRANSACTION_TYPE {
  WRAP = 'Wrap',
  UNWRAP = 'Unwrap',
  APPROVE = 'Approve',
  BRIDGE = 'Bridge',
  SWAP = 'Swap',
  CREATE_POOL = 'Create pool',
  ELASTIC_CREATE_POOL = 'Elastic Create pool',
  ADD_LIQUIDITY = 'Add liquidity',
  ELASTIC_ADD_LIQUIDITY = 'Elastic Add liquidity',
  REMOVE_LIQUIDITY = 'Remove liquidity',
  ELASTIC_REMOVE_LIQUIDITY = 'Elastic Remove liquidity',
  INCREASE_LIQUIDITY = 'Increase liquidity',
  COLLECT_FEE = 'Collect fee',
  STAKE = 'Stake',
  UNSTAKE = 'Unstake',
  HARVEST = 'Harvest',
  CLAIM = 'Claim',
  MIGRATE = 'Migrate',
  CLAIM_REWARD = 'Claim reward',
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
  FORCE_WITHDRAW = 'ForceWithdraw',
  SETUP = 'SetUp',
  CLEANUP = 'CleanUp',
}
