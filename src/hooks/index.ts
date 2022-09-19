import { Web3Provider } from '@ethersproject/providers'
import { ChainId, ChainType, getChainType } from '@namgold/ks-sdk-core'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { ethers } from 'ethers'
import { useEffect, useMemo, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useSelector } from 'react-redux'
import { useLocalStorage } from 'react-use'

import { injected } from 'connectors'
import { EVM_NETWORK, EVM_NETWORKS, NETWORKS_INFO } from 'constants/networks'
import { SUPPORTED_WALLET, SUPPORTED_WALLETS } from 'constants/wallets'
import { AppState } from 'state'
import { isEVMWallet, isSolanaWallet } from 'utils'

export const providers: {
  [chainId in EVM_NETWORK]: ethers.providers.JsonRpcProvider
} = EVM_NETWORKS.reduce(
  (acc, val) => {
    acc[val] = new ethers.providers.JsonRpcProvider(NETWORKS_INFO[val].rpcUrl)
    return acc
  },
  {} as {
    [chainId in EVM_NETWORK]: ethers.providers.JsonRpcProvider
  },
)

export function useActiveWeb3React(): {
  chainId: ChainId
  account?: string
  walletKey: SUPPORTED_WALLET | undefined
} {
  const chainIdState = useSelector<AppState, ChainId>(state => state.user.chainId) || ChainId.MAINNET
  const chainType = getChainType(chainIdState)
  const { account, connector, active } = useWeb3React()
  const { wallet: walletSolana, connected, publicKey } = useWallet()

  const address = useMemo(
    () => (chainType === ChainType.EVM ? account ?? undefined : publicKey?.toBase58()),
    [account, chainType, publicKey],
  )

  const walletKey = (Object.keys(SUPPORTED_WALLETS) as SUPPORTED_WALLET[]).find(walletKey => {
    const wallet = SUPPORTED_WALLETS[walletKey]

    return (
      (chainType === ChainType.EVM && active && isEVMWallet(wallet) && !!connector && wallet.connector === connector) ||
      (chainType === ChainType.SOLANA &&
        isSolanaWallet(wallet) &&
        wallet &&
        connected &&
        wallet.adapter === walletSolana?.adapter)
    )
  })

  return { chainId: chainIdState, account: address, walletKey }
}

export function useWeb3React(key?: string): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const { connector, library, chainId, account, active, error, activate, setError, deactivate } = useWeb3ReactCore(key)
  return {
    connector,
    library: library || providers[ChainId.MAINNET],
    chainId: chainId || ChainId.MAINNET,
    account,
    active,
    error,
    activate,
    setError,
    deactivate,
  } as Web3ReactContextInterface
}

async function isAuthorized(): Promise<boolean> {
  if (!window.ethereum) {
    return false
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })

    if (accounts?.length > 0) {
      return true
    }
    return false
  } catch {
    return false
  }
}

let globalTried = false

export function useEagerConnect() {
  const { chainId } = useActiveWeb3React()
  const chainType = getChainType(chainId)
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState(false)
  const [isManuallyDisconnect] = useLocalStorage('user-manually-disconnect')

  useEffect(() => {
    globalTried = tried
  }, [tried])

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!globalTried) setTried(true)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (chainType === ChainType.SOLANA) setTried(true)
    else {
      try {
        isAuthorized()
          .then(isAuthorized => {
            if (isAuthorized && !isManuallyDisconnect) {
              activate(injected, undefined, true).catch(() => {
                setTried(true)
              })
            } else {
              if (isMobile && window.ethereum) {
                activate(injected, undefined, true).catch(() => {
                  setTried(true)
                })
              } else {
                setTried(true)
              }
            }
          })
          .catch(e => {
            console.log('Eagerly connect: authorize error', e)
            setTried(true)
          })
      } catch (e) {
        console.log('Eagerly connect: authorize error', e)
        setTried(true)
      }
    }
  }, [activate, chainType, isManuallyDisconnect]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3React() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch(error => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}
