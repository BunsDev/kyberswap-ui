import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ChainId } from '@kyberswap/ks-sdk-core'
import { Connection } from '@solana/web3.js'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  KyberswapConfigurationResponse,
  KyberswapGlobalConfigurationResponse,
  useGetKyberswapConfigurationQuery,
  useGetKyberswapGlobalConfigurationQuery,
  useLazyGetKyberswapConfigurationQuery,
} from 'services/ksSetting'

import { AGGREGATOR_API } from 'constants/env'
import { NETWORKS_INFO, SUPPORTED_NETWORKS, isEVM, isSolana } from 'constants/networks'
import ethereumInfo from 'constants/networks/ethereum'
import solanaInfo from 'constants/networks/solana'
import { AppState } from 'state'
import { createClient } from 'utils/client'

type KyberswapConfig = {
  rpc: string
  prochart: boolean
  blockClient: ApolloClient<NormalizedCacheObject>
  classicClient: ApolloClient<NormalizedCacheObject>
  elasticClient: ApolloClient<NormalizedCacheObject>
  provider: ethers.providers.JsonRpcProvider | undefined
  connection: Connection | undefined
}

const parseResponse = (
  responseData: KyberswapConfigurationResponse | undefined,
  defaultChainId: ChainId,
): KyberswapConfig => {
  const data = responseData?.data?.config
  const rpc = data?.rpc ?? NETWORKS_INFO[defaultChainId].defaultRpcUrl
  return {
    rpc,
    prochart: data?.prochart ?? false,
    blockClient: isEVM(defaultChainId)
      ? createClient(data?.blockSubgraph ?? NETWORKS_INFO[defaultChainId].defaultBlockSubgraph)
      : createClient(ethereumInfo.defaultBlockSubgraph),
    classicClient: isEVM(defaultChainId)
      ? createClient(data?.classicSubgraph ?? NETWORKS_INFO[defaultChainId].classic.defaultSubgraph)
      : createClient(ethereumInfo.classic.defaultSubgraph),
    elasticClient: isEVM(defaultChainId)
      ? createClient(data?.elasticSubgraph ?? NETWORKS_INFO[defaultChainId].elastic.defaultSubgraph)
      : createClient(ethereumInfo.elastic.defaultSubgraph),
    provider: isEVM(defaultChainId) ? new ethers.providers.JsonRpcProvider(rpc) : undefined,
    connection: isSolana(defaultChainId)
      ? new Connection(data?.rpc ?? solanaInfo.defaultRpcUrl, { commitment: 'confirmed' })
      : undefined,
  }
}

type KyberswapGlobalConfig = {
  aggregatorDomain: string
  aggregatorAPI: string
}

const parseGlobalResponse = (
  responseData: KyberswapGlobalConfigurationResponse | undefined,
  chainId: ChainId,
): KyberswapGlobalConfig => {
  const data = responseData?.data?.config
  const aggregatorDomain = data?.aggregator ?? AGGREGATOR_API
  return {
    aggregatorDomain,
    aggregatorAPI: `${aggregatorDomain}/${NETWORKS_INFO[chainId].aggregatorRoute}/route/encode`,
  }
}
export const useKyberswapConfig = (customChainId?: ChainId): KyberswapConfig => {
  const chainId = useSelector<AppState, ChainId>(state => state.user.chainId) || ChainId.MAINNET // read directly from store instead of useActiveWeb3React to prevent circular loop
  const { data } = useGetKyberswapConfigurationQuery({ chainId: customChainId ?? chainId })
  const result = useMemo(() => parseResponse(data, chainId), [chainId, data])
  return result
}

export const useKyberswapGlobalConfig = () => {
  const chainId = useSelector<AppState, ChainId>(state => state.user.chainId) || ChainId.MAINNET // read directly from store instead of useActiveWeb3React to prevent circular loop
  const { data } = useGetKyberswapGlobalConfigurationQuery(undefined)
  const result = useMemo(() => parseGlobalResponse(data, chainId), [data, chainId])
  return result
}

export const useAllKyberswapConfig = (): {
  [chain in ChainId]: KyberswapConfig
} => {
  const [allKyberswapConfig, setAllKyberswapConfig] = useState<
    | {
        [chain in ChainId]: KyberswapConfig
      }
    | null
  >(null)
  const [getKyberswapConfiguration] = useLazyGetKyberswapConfigurationQuery()

  useEffect(() => {
    const run = async () => {
      const fetches = SUPPORTED_NETWORKS.map(async chainId => {
        try {
          const { data } = await getKyberswapConfiguration({ chainId })
          return {
            chainId,
            result: parseResponse(data, chainId),
          }
        } catch {
          return {
            chainId,
            result: parseResponse(undefined, chainId),
          }
        }
      })
      const results = await Promise.all(fetches)
      setAllKyberswapConfig(
        results.reduce(
          (acc, cur) => {
            acc[cur.chainId] = cur.result
            return acc
          },
          {} as {
            [chainId in ChainId]: KyberswapConfig
          },
        ),
      )
    }
    run()
  }, [getKyberswapConfiguration])

  const defaultConfig = useMemo(
    () =>
      SUPPORTED_NETWORKS.reduce(
        (acc, cur) => {
          acc[cur] = parseResponse(undefined, cur)
          return acc
        },
        {} as {
          [chainId in ChainId]: KyberswapConfig
        },
      ),
    [],
  )

  return allKyberswapConfig ?? defaultConfig
}
