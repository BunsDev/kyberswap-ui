import { Trans, t } from '@lingui/macro'
import { rgba } from 'polished'
import { ReactNode, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import styled, { css } from 'styled-components'

import Column from 'components/Column'
import CopyHelper from 'components/Copy'
import DropdownIcon from 'components/Icons/DropdownIcon'
import Icon from 'components/Icons/Icon'
import { DotsLoader } from 'components/Loader/DotsLoader'
import Row, { RowBetween, RowFit } from 'components/Row'
import { MouseoverTooltip } from 'components/Tooltip'
import useTheme from 'hooks/useTheme'
import { MEDIA_WIDTHS } from 'theme'
import { getEtherscanLink, shortenAddress } from 'utils'

import { NETWORK_IMAGE_URL, NETWORK_TO_CHAINID } from '../constants'
import { ITokenOverview } from '../types'
import { calculateValueToColor, formatLocaleStringNum, formatTokenPrice } from '../utils'
import ChevronIcon from './ChevronIcon'
import KyberScoreMeter from './KyberScoreMeter'
import PriceRange from './PriceRange'
import SimpleTooltip from './SimpleTooltip'
import KyberScoreChart from './chart/KyberScoreChart'

const CardWrapper = styled.div<{ gap?: string }>`
  --background-color: ${({ theme }) => (theme.darkMode ? theme.text + '22' : theme.subText + '20')};

  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    200deg,
    ${({ theme }) => (theme.darkMode ? rgba(24, 24, 24, 0.15) : rgba(224, 224, 224, 0.15))} -4%,
    var(--background-color) 100%
  );
  box-shadow: inset 0px 2px 2px rgba(255, 255, 255, 0.2), 0px 4px 8px var(--background-color);
  transition: all 0.5s ease;
  ::after {
    bottom: 0;
    left: 0;
    right: 0;
    content: ' ';
    display: block;
    position: absolute;
    width: 100%;
    height: 20%;
    background: var(--background-color);
    filter: blur(140px) brightness(1.5);
    z-index: 1;
  }

  &.bullish {
    --background-color: ${({ theme }) => (theme.darkMode ? theme.primary + '32' : theme.primary + '40')};
  }
  &.bearish {
    --background-color: ${({ theme }) => (theme.darkMode ? theme.red + '32' : theme.red + '60')};
  }

  ${({ theme, gap }) => css`
    background-color: ${theme.background};
    gap: ${gap || '0px'};
  `}
  > * {
    flex: 1;
    z-index: 2;
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 16px;
  `}
`

const ExpandableBox = styled.div<{ expanded?: boolean; height?: number }>`
  height: 0px;
  overflow: hidden;
  transition: all 0.2s ease;
  flex: unset;
  ${({ expanded, height }) => (expanded ? `height: ${height}px;` : ``)}
`

// const PerformanceCard = styled.div<{ color: string }>`
//   border-radius: 8px;
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 4px;
//   padding: 6px;
//   background-color: ${({ color }) => color + '48'};
//   color: ${({ color }) => color};
// `

const getCommunityLabelFromURL = (url: string) => {
  if (url.includes('facebook')) {
    return 'Facebook'
  }
  if (url.includes('twitter')) {
    return 'Twitter'
  }
  if (url.includes('discord')) {
    return 'Discord'
  }
  if (url.includes('t.me')) {
    return 'Telegram'
  }
  if (url.includes('medium')) {
    return 'Medium'
  }
  if (url.includes('instagram')) {
    return 'Instagram'
  }

  return url.split('://')[1]
}

const ExternalLinkWrapper = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  transition: all 0.2s ease;
  background-color: ${({ theme }) => theme.background + '80'};
  padding: 4px 6px;
  border-radius: 4px;
  :hover {
    color: ${({ theme }) => theme.primary};
    background-color: ${({ theme }) => theme.tableHeader + '80'};
  }
`
const ExternalLink = ({ href, className, children }: { href: string; className?: string; children?: ReactNode }) => {
  return (
    <ExternalLinkWrapper className={className} href={href} target="_blank" rel="noreferrer">
      {children}
    </ExternalLinkWrapper>
  )
}

export const TokenOverview = ({ data, isLoading }: { data?: ITokenOverview; isLoading?: boolean }) => {
  const theme = useTheme()
  const { chain } = useParams()
  const above768 = useMedia(`(min-width:${MEDIA_WIDTHS.upToSmall}px)`)
  const [expanded, setExpanded] = useState(false)
  const ref1 = useRef<HTMLDivElement>(null)
  const ref2 = useRef<HTMLDivElement>(null)
  const cardClassname = useMemo(() => {
    if (!data?.kyberScore || data?.kyberScore.score === 0) return ''
    if (data?.kyberScore.score >= 60) return 'bullish'
    if (data?.kyberScore.score < 40) return 'bearish'
    return ''
  }, [data])
  const priceChangeColor = data && data.price24hChangePercent > 0 ? theme.primary : theme.red
  return (
    <>
      {above768 ? (
        <>
          <Row align="stretch" gap="24px" flexDirection={above768 ? 'row' : 'column'} marginBottom="12px">
            <CardWrapper className={cardClassname}>
              <Column flex={0}>
                <Text color={theme.text} fontSize="14px" lineHeight="20px" marginBottom="12px" fontWeight={500}>
                  <Trans>Price</Trans>
                </Text>
                <RowFit gap="8px">
                  <Text fontSize={28} lineHeight="32px" color={theme.text}>
                    {isLoading ? <DotsLoader /> : '$' + formatTokenPrice(data?.price || 0)}
                  </Text>
                  <Text
                    color={data && data.price24hChangePercent > 0 ? theme.primary : theme.red}
                    fontSize="12px"
                    backgroundColor={rgba(data && data.price24hChangePercent > 0 ? theme.primary : theme.red, 0.2)}
                    display="inline"
                    padding="4px 8px"
                    style={{ borderRadius: '16px' }}
                  >
                    <RowFit gap="2px">
                      <ChevronIcon
                        rotate={data && data.price24hChangePercent > 0 ? '180deg' : '0deg'}
                        color={priceChangeColor}
                      />
                      {data?.price24hChangePercent ? Math.abs(data.price24hChangePercent).toFixed(2) : 0}%
                    </RowFit>
                  </Text>
                </RowFit>
                <Row color={priceChangeColor} fontSize={12} lineHeight="16px">
                  <ChevronIcon
                    rotate={data && data.price24hChangePercent > 0 ? '180deg' : '0deg'}
                    color={priceChangeColor}
                  />
                  {data && '$' + formatTokenPrice(Math.abs(data.price24hChangePercent * data.price) / 100)}
                </Row>
              </Column>
              <Column justifyContent="center">
                <PriceRange
                  title={t`Daily Range`}
                  high={data?.['24hHigh'] || 0}
                  low={data?.['24hLow'] || 0}
                  current={+(data?.price || 0)}
                  style={{ flex: 'initial' }}
                />
                <PriceRange
                  title={t`1Y Range`}
                  high={data?.['1yHigh'] || 0}
                  low={data?.['1yLow'] || 0}
                  current={data?.price ? +data.price : 0}
                  style={{ flex: 'initial' }}
                />
              </Column>
              {/*  <Column gap="6px" style={{ justifyContent: 'end' }}>
                <Text fontSize="12px">
                  <Trans>Performance</Trans>
                </Text>
                <Row gap="8px">
                  <PerformanceCard color={theme.red}>
                    <Text fontSize="12px">-8.36%</Text>
                    <Text color={theme.text} fontSize="10px">
                      1W
                    </Text>
                  </PerformanceCard>
                  <PerformanceCard color={theme.primary}>
                    <Text color={theme.primary} fontSize="12px">
                      18.33%
                    </Text>
                    <Text color={theme.text} fontSize="10px">
                      1M
                    </Text>
                  </PerformanceCard>
                  <PerformanceCard color={theme.primary}>
                    <Text color={theme.primary} fontSize="12px">
                      142.55%
                    </Text>
                    <Text color={theme.text} fontSize="10px">
                      3M
                    </Text>
                  </PerformanceCard>
                  <PerformanceCard color={theme.primary}>
                    <Text color={theme.primary} fontSize="12px">
                      32.27%
                    </Text>
                    <Text color={theme.text} fontSize="10px">
                      6M
                    </Text>
                  </PerformanceCard>
                </Row> 
              </Column>*/}
            </CardWrapper>
            <CardWrapper style={{ alignItems: 'center', gap: '12px' }} className={cardClassname}>
              <Row marginBottom="4px">
                <MouseoverTooltip
                  text={
                    <Trans>
                      KyberScore uses AI to measure the upcoming trend of a token (bullish or bearish) by taking into
                      account multiple on-chain and off-chain indicators. The score ranges from 0 to 100. Higher the
                      score, more bullish the token in the short-term. Read more{' '}
                      <a href="https://docs.kyberswap.com">here ↗</a>
                    </Trans>
                  }
                  placement="top"
                  width="350px"
                >
                  <Text
                    style={{ borderBottom: `1px dotted ${theme.text}` }}
                    color={theme.text}
                    fontSize="14px"
                    lineHeight="20px"
                    fontWeight={500}
                  >
                    KyberScore
                  </Text>
                </MouseoverTooltip>
              </Row>
              <KyberScoreMeter value={data?.kyberScore?.score} />
              <RowFit gap="6px" marginBottom="12px">
                <Text
                  fontSize={24}
                  fontWeight={500}
                  color={isLoading ? theme.subText : calculateValueToColor(data?.kyberScore?.score || 0, theme)}
                >
                  {isLoading
                    ? t`Loading`
                    : data?.kyberScore === undefined || data?.kyberScore?.score === 0
                    ? t`Not Available`
                    : data.kyberScore.label}
                </Text>
                <MouseoverTooltip
                  text={
                    <>
                      <Column color={theme.subText} style={{ fontSize: '12px', lineHeight: '16px' }}>
                        {/* <Text>24/04/2023 08:00 AM</Text> */}
                        <Text>
                          KyberScore:{' '}
                          <span style={{ color: calculateValueToColor(data?.kyberScore?.score || 0, theme) }}>
                            {data?.kyberScore?.score || '--'} ({data?.kyberScore?.label || t`Not Available`})
                          </span>
                        </Text>
                        <Text>
                          Token Price: <span style={{ color: theme.text }}>$0.000000423</span>
                        </Text>
                      </Column>
                    </>
                  }
                  placement="top"
                >
                  <Icon id="timer" size={16} />
                </MouseoverTooltip>
              </RowFit>
              <Column style={{ width: '100%' }} gap="2px">
                <Text fontSize="12px" lineHeight="16px">
                  <Trans>Last 3D KyberScores</Trans>
                </Text>
                <KyberScoreChart width="100%" height="36px" data={data?.kyberScore?.ks3d} />
              </Column>
            </CardWrapper>
            <CardWrapper style={{ fontSize: '12px' }} gap="10px" className={cardClassname}>
              <Text color={theme.text} marginBottom="4px" fontSize="14px" lineHeight="20px" fontWeight={500}>
                Key Stats
              </Text>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>All Time Low</Trans>
                </Text>
                <Text color={theme.text} fontWeight={500}>
                  {data?.atl ? `$${formatTokenPrice(data?.atl, 4)}` : '--'}
                </Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>All Time High</Trans>
                </Text>
                <Text color={theme.text} fontWeight={500}>
                  {data?.ath ? `$${formatTokenPrice(data?.ath, 4)}` : '--'}
                </Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>24H Volume</Trans>
                </Text>
                <Text color={theme.text} fontWeight={500}>
                  {data?.['24hVolume'] ? `$${formatLocaleStringNum(data?.['24hVolume'], 0)}` : '--'}
                </Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Circulating Supply</Trans>
                </Text>
                <Text color={theme.text} fontWeight={500}>
                  {data?.circulatingSupply
                    ? `${formatLocaleStringNum(data.circulatingSupply, 0)} ${data.symbol}`
                    : '--'}
                </Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Market Cap</Trans>
                </Text>
                <Text color={theme.text} fontWeight={500}>
                  {data?.marketCap ? `$${formatLocaleStringNum(data?.marketCap)}` : '--'}
                </Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Holders (On-chain)</Trans>
                </Text>
                <Text color={theme.text} fontWeight={500}>
                  {data?.numberOfHolders || '--'}
                </Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Website</Trans>
                </Text>
                {data?.webs?.[0] && <ExternalLink href={data.webs[0] || ''}>{data?.webs[0]}</ExternalLink>}
              </RowBetween>
              <RowBetween align="flex-start">
                <Text color={theme.subText} lineHeight="24px">
                  <Trans>Community</Trans>
                </Text>
                {/* {data?.communities?.[0] && (
                  <ExternalLink href={data.communities[0].value || ''}>{data.communities[0]}</ExternalLink>
                )} */}
                <Row gap="6px" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {data?.communities?.map((c, index) => {
                    return (
                      <ExternalLink key={index} href={c}>
                        {getCommunityLabelFromURL(c)}
                      </ExternalLink>
                    )
                  })}
                </Row>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Address</Trans>
                </Text>
                {data && chain ? (
                  <RowFit gap="4px">
                    <SimpleTooltip text={t`Open scan explorer`}>
                      <a
                        style={{
                          borderRadius: '50%',
                          cursor: 'pointer',
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={getEtherscanLink(NETWORK_TO_CHAINID[chain], data.address, 'token')}
                      >
                        <img
                          src={NETWORK_IMAGE_URL[chain || 'ethereum']}
                          alt="eth"
                          width="16px"
                          height="16px"
                          style={{ display: 'block' }}
                        />
                      </a>
                    </SimpleTooltip>
                    <Text color={theme.subText} fontWeight={500}>
                      {shortenAddress(1, data.address)}
                    </Text>
                    <SimpleTooltip text={t`Copy token address`}>
                      <CopyHelper toCopy={data?.address || ''} />
                    </SimpleTooltip>
                  </RowFit>
                ) : (
                  <></>
                )}
              </RowBetween>
            </CardWrapper>
          </Row>
          <Row justify="center" marginBottom="38px">
            <Text fontSize="12px" lineHeight="16px" fontStyle="italic">
              <Trans>Disclaimer: This should not be considered as financial advice</Trans>
            </Text>
          </Row>
        </>
      ) : (
        <CardWrapper style={{ marginBottom: '16px' }}>
          <RowFit gap="8px">
            <Text fontSize={28} lineHeight="32px" fontWeight={500} color={theme.text}>
              {isLoading ? <DotsLoader /> : '$' + (+(data?.price || 0)).toLocaleString()}
            </Text>
            <Text
              color={theme.red}
              fontSize="12px"
              backgroundColor={rgba(theme.red, 0.2)}
              display="inline"
              padding="4px 8px"
              style={{ borderRadius: '16px' }}
            >
              {data?.price24hChangePercent ? data?.price24hChangePercent.toFixed(2) : 0}%
            </Text>
          </RowFit>
          <ExpandableBox expanded={expanded} height={ref1?.current?.scrollHeight} ref={ref1}>
            <PriceRange
              title={t`Daily Range`}
              high={data?.['24hHigh'] || 0}
              low={data?.['24hLow'] || 0}
              current={+(data?.price || 0)}
              style={{ marginBottom: '16px' }}
            />
            <PriceRange
              title={t`1Y Range`}
              high={data?.['1yHigh'] || 0}
              low={data?.['1yLow'] || 0}
              current={data?.price ? +data.price : 0}
            />
          </ExpandableBox>
          <Row style={{ borderBottom: `1px solid ${theme.border}`, margin: '16px 0' }} />
          <Row marginBottom="8px">
            <MouseoverTooltip
              text={
                <Trans>
                  KyberScore uses AI to measure the upcoming trend of a token (bullish or bearish) by taking into
                  account multiple on-chain and off-chain indicators. The score ranges from 0 to 100. Higher the score,
                  more bullish the token in the short-term. Read more <a href="https://docs.kyberswap.com">here ↗</a>
                </Trans>
              }
              placement="top"
              width="350px"
            >
              <Text
                fontSize="14px"
                fontWeight={500}
                style={{ borderBottom: `1px dotted ${theme.text}` }}
                color={theme.text}
              >
                KyberScore
              </Text>
            </MouseoverTooltip>
          </Row>
          <Row justify="center" marginBottom="12px">
            <KyberScoreMeter value={data?.kyberScore?.score} />
          </Row>
          <Row marginBottom="16px" justify="center">
            <Text
              fontSize="24px"
              lineHeight="28px"
              fontWeight={500}
              color={isLoading ? theme.subText : calculateValueToColor(data?.kyberScore?.score || 0, theme)}
            >
              {isLoading
                ? t`Loading`
                : data?.kyberScore === undefined || data?.kyberScore?.score === 0
                ? t`Not Available`
                : data.kyberScore.label}
            </Text>
          </Row>
          <ExpandableBox expanded={expanded} height={ref2?.current?.scrollHeight} ref={ref2}>
            <Row style={{ borderBottom: `1px solid ${theme.border}`, marginBottom: '16px' }} />
            <Column gap="10px" style={{ fontSize: '12px', lineHeight: '16px' }}>
              <Text fontSize="14px" lineHeight="20px" color={theme.text} marginBottom="4px">
                Key Stats
              </Text>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>All Time Low</Trans>
                </Text>
                <Text color={theme.text}>{data?.atl && formatTokenPrice(data?.atl)}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>All Time High</Trans>
                </Text>
                <Text color={theme.text}>{data?.ath && formatTokenPrice(data?.ath)}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>24H Volume</Trans>
                </Text>
                <Text color={theme.text}>{data?.['24hVolume'] && formatLocaleStringNum(data?.['24hVolume'])}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Circulating Supply</Trans>
                </Text>
                <Text color={theme.text}>{data && data.circulatingSupply + ' ' + data.symbol}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Market Cap</Trans>
                </Text>
                <Text color={theme.text}>{data?.marketCap && formatLocaleStringNum(data?.marketCap)}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Holders (On-chain)</Trans>
                </Text>
                <Text color={theme.text}>{data?.numberOfHolders}</Text>
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Website</Trans>
                </Text>
                {data?.webs?.[0] && <ExternalLink href={data.webs[0] || ''}>{data?.webs[0]}</ExternalLink>}
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Community</Trans>
                </Text>
                {/* {data?.communities?.[0] && (
                  <ExternalLink href={data.communities[0].value || ''}>{data.communities[0].key}</ExternalLink>
                )} */}
              </RowBetween>
              <RowBetween>
                <Text color={theme.subText}>
                  <Trans>Address</Trans>
                </Text>
                <Text color={theme.subText}>0x394...5e3</Text>
              </RowBetween>
            </Column>
          </ExpandableBox>

          <Row justify="center" onClick={() => setExpanded(p => !p)}>
            <div style={{ transform: expanded ? 'rotate(180deg)' : '', transition: 'all 0.2s ease' }}>
              <DropdownIcon />
            </div>
            <Text fontSize="12px" lineHeight="16px" fontWeight={500}>
              {expanded ? <Trans>View Less Stats</Trans> : <Trans>View More Stats</Trans>}
            </Text>
          </Row>
        </CardWrapper>
      )}
    </>
  )
}
