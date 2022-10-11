import { Currency } from '@kyberswap/ks-sdk-core'
import React, { memo, useMemo } from 'react'
import styled from 'styled-components'

import { NETWORKS_INFO } from 'constants/networks'
import { useActiveWeb3React } from 'hooks'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { getTokenLogoURL } from 'utils'

import useHttpLocations from '../../hooks/useHttpLocations'
import Logo from '../Logo'

const StyledNativeCurrencyLogo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  border-radius: 24px;
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  object-fit: contain;
`

function CurrencyLogo({
  currency,
  size = '24px',
  style,
}: {
  currency?: Currency | null
  size?: string
  style?: React.CSSProperties
}) {
  const { chainId } = useActiveWeb3React()
  const logoURI = (currency as any).logoURI
  const hasLogo = currency instanceof WrappedTokenInfo || logoURI
  const uriLocations = useHttpLocations(hasLogo ? logoURI : undefined)

  const srcs: string[] = useMemo(() => {
    if (currency?.isNative) return []

    if (currency?.isToken) {
      if (hasLogo) {
        return [...uriLocations, getTokenLogoURL(currency.address, chainId)]
      }
      return [getTokenLogoURL((currency as any)?.address, chainId)]
    }

    return []
  }, [chainId, currency, uriLocations, hasLogo])

  if (currency?.isNative && chainId) {
    return (
      <StyledNativeCurrencyLogo
        src={NETWORKS_INFO[chainId].nativeToken.logo}
        size={size}
        style={style}
        alt={`${currency.symbol}Logo`}
      />
    )
  }

  return <StyledLogo size={size} srcs={srcs} alt={`${currency?.symbol ?? 'token'} logo`} style={style} />
}
export default memo(CurrencyLogo)
