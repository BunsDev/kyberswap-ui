import useSWR from 'swr'

import { TRUESIGHT_V2_API } from 'constants/env'

import { testParams } from '../pages/SingleToken'
import {
  IFundingRate,
  IHolderList,
  INetflowToWhaleWallets,
  INumberOfHolders,
  INumberOfTrades,
  ITokenOverview,
  ITradeVolume,
} from '../types'
import {
  FUNDING_RATE,
  HOLDER_LIST,
  NETFLOW_TO_WHALE_WALLETS,
  NUMBER_OF_HOLDERS,
  NUMBER_OF_TRADES,
  TOKEN_DETAIL,
  TRADE_VOLUME,
} from './sampleData'

export function useTokenDetail(tokenAddress: string) {
  const { data, isLoading } = useSWR<ITokenOverview>(
    tokenAddress && `${TRUESIGHT_V2_API}/overview/ethereum/${tokenAddress}`,
    (url: string) =>
      fetch(url)
        .then(res => res.json())
        .then(res => {
          return TOKEN_DETAIL
        }),
  )
  return { data: TOKEN_DETAIL || data, isLoading }
}

export function useNumberOfTrades(tokenAddress: string) {
  const { data, isLoading } = useSWR<INumberOfTrades>(
    tokenAddress && `${TRUESIGHT_V2_API}/trades/ethereum/${tokenAddress}?from=${testParams.from}&to=${testParams.to}`,
    (url: string) =>
      fetch(url)
        .then(res => res.json())
        .then(res => {
          return res.data
        }),
  )
  return { data: NUMBER_OF_TRADES || data, isLoading }
}

export function useTradingVolume(tokenAddress: string) {
  const { data, isLoading } = useSWR<ITradeVolume[]>(
    tokenAddress && `${TRUESIGHT_V2_API}/volume/ethereum/${tokenAddress}?from=${testParams.from}&to=${testParams.to}`,
    (url: string) =>
      fetch(url)
        .then(res => res.json())
        .then(res => {
          return res.data
        }),
  )
  return { data: TRADE_VOLUME || data, isLoading }
}

export function useNetflowToWhaleWallets(tokenAddress: string) {
  const { data, isLoading } = useSWR<INetflowToWhaleWallets[]>(
    tokenAddress && `${TRUESIGHT_V2_API}/netflow/ethereum/${tokenAddress}?from=${testParams.from}&to=${testParams.to}`,
    (url: string) =>
      fetch(url)
        .then(res => res.json())
        .then(res => {
          return NETFLOW_TO_WHALE_WALLETS
        }),
  )
  return { data: NETFLOW_TO_WHALE_WALLETS || data, isLoading }
}
export function useNetflowToCEX(tokenAddress: string) {
  const { data, isLoading } = useSWR<INetflowToWhaleWallets[]>(
    tokenAddress && `${TRUESIGHT_V2_API}/netflow/cexes`,
    (url: string) =>
      fetch(url)
        .then(res => res.json())
        .then(res => {
          return NETFLOW_TO_WHALE_WALLETS
        }),
  )
  return { data: NETFLOW_TO_WHALE_WALLETS || data, isLoading }
}
export function useNumberOfHolders(tokenAddress: string) {
  const { data, isLoading } = useSWR<INumberOfHolders[]>(
    tokenAddress &&
      `${TRUESIGHT_V2_API}/holdersNum/ethereum/${tokenAddress}?from=${testParams.from}&to=${testParams.to}`,
    (url: string) =>
      fetch(url)
        .then(res => res.json())
        .then(res => {
          return NUMBER_OF_HOLDERS
        }),
  )
  return { data: NUMBER_OF_HOLDERS || data, isLoading }
}
export function useHolderList(tokenAddress: string) {
  const { data, isLoading } = useSWR<IHolderList[]>(
    tokenAddress && `${TRUESIGHT_V2_API}/holders/ethereum/${tokenAddress}?from=${testParams.from}&to=${testParams.to}`,
    (url: string) =>
      fetch(url)
        .then(res => res.json())
        .then(res => {
          return HOLDER_LIST
        }),
  )
  return { data: HOLDER_LIST || data, isLoading }
}

export function useFundingRate() {
  const { data, isLoading } = useSWR<IFundingRate[]>(`${TRUESIGHT_V2_API}/holders/ethereum/C/BTC`, (url: string) =>
    fetch(url)
      .then(res => res.json())
      .then(res => {
        return FUNDING_RATE
      }),
  )
  return { data: FUNDING_RATE || data, isLoading }
}

export function useTokenList() {
  return {
    tokenList: {
      data: [
        {
          id: 1,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 2,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 3,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 4,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 5,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 6,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 7,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 8,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 9,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 10,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 11,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 12,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 13,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 14,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 15,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 16,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 17,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 18,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 19,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 20,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
        {
          id: 21,
          symbol: 'KNC',
          tokenName: 'Kyber Network Crystal',
          chain: 1,
          price: '0.00000004234',
          change: '20%',
          '24hVolume': '500M',
          kyberscore: '88',
        },
      ],
      totalItems: 21,
    },
  }
}
