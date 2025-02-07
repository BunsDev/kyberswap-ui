import { ChainId } from '@kyberswap/ks-sdk-core'
import { PublicKey } from '@solana/web3.js'

import { EnvKeys } from 'constants/env'

export interface NetworkInfo {
  readonly chainId: ChainId

  // route can be used to detect which chain is favored in query param, check out useActiveNetwork.ts
  readonly route: string
  readonly ksSettingRoute: string
  readonly priceRoute: string
  readonly aggregatorRoute: string
  readonly name: string
  readonly icon: string
  readonly iconDark: string | null
  readonly iconSelected: string | null
  readonly iconDarkSelected: string | null
  readonly etherscanUrl: string
  readonly etherscanName: string
  readonly bridgeURL: string
  readonly nativeToken: {
    readonly symbol: string
    readonly name: string
    readonly logo: string
    readonly decimal: number
    readonly minForGas: number
  }
  readonly coingeckoNetworkId: string | null //https://api.coingecko.com/api/v3/asset_platforms
  readonly coingeckoNativeTokenId: string | null //https://api.coingecko.com/api/v3/coins/list
  readonly dexToCompare: string | null
  readonly limitOrder: null | '*' | EnvKeys[]
  readonly defaultRpcUrl: string
  // token: {
  //   DAI: Token
  //   USDC: Token
  //   USDT: Token
  // }
  readonly geckoTermialId: string | null
}

export interface EVMNetworkInfo extends NetworkInfo {
  readonly poolFarmRoute: string // use this to get data from our internal BE
  readonly defaultBlockSubgraph: string
  readonly multicall: string
  readonly classic: {
    readonly defaultSubgraph: string
    readonly static: {
      readonly zap: string
      readonly router: string
      readonly factory: string
    }
    readonly oldStatic: {
      readonly zap: string
      readonly router: string
      readonly factory: string
    } | null
    readonly dynamic: {
      readonly zap: string
      readonly router: string
      readonly factory: string
    } | null
    readonly claimReward: string | null
    readonly fairlaunch: string[]
    readonly fairlaunchV2: string[]
    readonly fairlaunchV3?: string[]
  }
  readonly elastic: {
    readonly defaultSubgraph: string
    readonly startBlock: number
    readonly coreFactory: string
    readonly nonfungiblePositionManager: string
    readonly tickReader: string
    readonly initCodeHash: string
    readonly quoter: string
    readonly routers: string
    readonly farms: string[]
    readonly farmv2Quoter?: string
    readonly farmV2S?: string[]
  }
  readonly limitOrder: null | '*' | EnvKeys[]
  readonly averageBlockTimeInSeconds: number
  readonly deBankSlug: string
  readonly kyberDAO?: {
    readonly staking: string
    readonly dao: string
    readonly rewardsDistributor: string
    readonly daoStatsApi: string
    readonly KNCAddress: string
    readonly KNCLAddress: string
  }
}

export interface SolanaNetworkInfo extends NetworkInfo {
  // readonly classic: {
  //   readonly pool: string
  //   readonly factory: string
  //   readonly router: string
  // }
  aggregatorProgramAddress: string
  openBookAddress: PublicKey
}
