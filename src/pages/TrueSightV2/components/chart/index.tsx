import dayjs from 'dayjs'
import { rgba } from 'polished'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useParams } from 'react-router-dom'
import { useMedia } from 'react-use'
import { Text } from 'rebass'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PoolResponse, useGetPoolDetailQuery } from 'services/geckoTermial'
import styled, { css } from 'styled-components'

import Column from 'components/Column'
import Row, { RowFit } from 'components/Row'
import { ChartingLibraryWidgetOptions, ResolutionString } from 'components/TradingViewChart/charting_library'
import { useDatafeed } from 'components/TradingViewChart/datafeed'
import { useActiveWeb3React } from 'hooks'
import useTheme from 'hooks/useTheme'
import {
  NETFLOW_TO_WHALE_WALLETS,
  NUMBER_OF_HOLDERS,
  NUMBER_OF_TRADES,
  NUMBER_OF_TRANSFERS,
  TRADE_VOLUME,
} from 'pages/TrueSightV2/hooks/sampleData'
import {
  useNetflowToCEXQuery,
  useNetflowToWhaleWalletsQuery,
  useNumberOfHoldersQuery,
  useNumberOfTradesQuery,
  useNumberOfTransfersQuery,
  useTradingVolumeQuery,
} from 'pages/TrueSightV2/hooks/useTruesightV2Data'
import { testParams } from 'pages/TrueSightV2/pages/SingleToken'
import { ChartTab } from 'pages/TrueSightV2/types'
import { MEDIA_WIDTHS } from 'theme'
import { shortenAddress } from 'utils'

import { ContentWrapper } from '..'
import SignedBarChart from './SignedBarChart'

const ChartWrapper = styled(ContentWrapper)`
  flex: 1;
`

const LegendWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  gap: 20px;
  z-index: 10;
  user-select: none;

  > * {
    cursor: pointer;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    left:0;
    justify-content: center;
    > * {
      flex: 1;
    }
  `}
`

const LegendButtonWrapper = styled.div<{ enabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.1s ease-out;
  :active {
    transform: scale(1.06);
  }
  :hover {
    filter: brightness(1.5);
  }
  ${({ enabled }) =>
    enabled
      ? css`
          opacity: 1;
        `
      : css`
          opacity: 0.5;
        `};
`

const LegendButton = ({
  enabled,
  onClick,
  text,
  iconStyle,
}: {
  enabled?: boolean
  onClick?: () => void
  text?: string
  iconStyle?: React.CSSProperties
}) => {
  const theme = useTheme()
  return (
    <LegendButtonWrapper enabled={enabled} onClick={onClick}>
      <div
        style={{ height: '16px', width: '16px', borderRadius: '8px', backgroundColor: theme.primary, ...iconStyle }}
      />
      <Text fontSize={12} fontWeight={500}>
        {text || 'Legend text'}
      </Text>
    </LegendButtonWrapper>
  )
}

const ShortLegend = ({ enabled, onClick }: { enabled?: boolean; onClick?: () => void }) => {
  const theme = useTheme()
  return (
    <RowFit gap="4px" style={{ cursor: 'pointer' }}>
      <div style={{ height: '16px', width: '16px', borderRadius: '8px', backgroundColor: theme.primary }} />
      <Text fontSize={12} fontWeight={500}>
        Short
      </Text>
    </RowFit>
  )
}

const LongLegend = ({ enabled, onClick }: { enabled?: boolean; onClick?: () => void }) => {
  const theme = useTheme()
  return (
    <RowFit gap="4px" style={{ cursor: 'pointer' }}>
      <div style={{ height: '16px', width: '16px', borderRadius: '8px', backgroundColor: theme.red }} />
      <Text fontSize={12} fontWeight={500}>
        Long
      </Text>
    </RowFit>
  )
}

const PriceLegend = ({ enabled, onClick }: { enabled?: boolean; onClick?: () => void }) => {
  const theme = useTheme()
  return (
    <RowFit gap="4px" style={{ cursor: 'pointer' }}>
      <div style={{ height: '4px', width: '16px', borderRadius: '8px', backgroundColor: theme.blue }} />
      <Text fontSize={12} fontWeight={500}>
        Price
      </Text>
    </RowFit>
  )
}

const TimeFrameWrapper = styled.div`
  height: 28px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  position: relative;
  background-color: ${({ theme }) => theme.buttonBlack};
  border: 2px solid ${({ theme }) => theme.buttonBlack};
  color: ${({ theme }) => theme.subText};
  cursor: pointer;
`
const Element = styled.div<{ active?: boolean; count?: number }>`
  padding: 6px 12px;
  width: calc(100% / ${({ count }) => count || 1});
  z-index: 2;
  display: flex;
  justify-content: center;
  ${({ active, theme }) => active && `color: ${theme.text};`}
  :hover {
    filter: brightness(1.2);
  }
`

const ActiveElement = styled.div<{ left?: number; width?: number }>`
  width: 25%;
  height: 24px;
  border-radius: 20px;
  position: absolute;
  left: 0;
  background-color: ${({ theme }) => theme.tableHeader};
  z-index: 1;
  transition: all 0.2s ease;
  :hover {
    filter: brightness(1.2);
  }

  ${({ left, width }) => css`
    transform: translateX(${left ?? 0}px);
    width: ${width || 40}px;
  `}
`

const TimeFrameLegend = ({
  selected,
  timeframes,
  onSelect,
}: {
  selected: string
  timeframes: string[]
  onSelect: (timeframe: string) => void
}) => {
  const refs = useRef<any>({})
  if (timeframes?.length < 1) return null
  return (
    <TimeFrameWrapper>
      {timeframes.map((t: string, index: number) => {
        return (
          <Element
            key={index}
            ref={el => {
              refs.current[t] = el
            }}
            onClick={() => onSelect?.(t)}
            active={selected === t}
            count={timeframes.length}
          >
            {t}
          </Element>
        )
      })}
      <ActiveElement left={refs.current?.[selected]?.offsetLeft} width={refs.current?.[selected]?.offsetWidth} />
    </TimeFrameWrapper>
  )
}

const TooltipWrapper = styled.div`
  background-color: ${({ theme }) => theme.buttonBlack + 'F3'};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.32);
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  :active {
    border: none;
  }
`

export const ANIMATION_DELAY = 500
export const ANIMATION_DURATION = 1000

const formatNum = (num: number): string => {
  const negative = num < 0
  const absNum = Math.abs(num)
  let formattedNum = ''
  if (absNum > 1000) {
    formattedNum = (absNum / 1000).toFixed(2) + 'K'
  } else if (absNum > 1000000) {
    formattedNum = (absNum / 1000000).toFixed(2) + 'M'
  } else {
    formattedNum = absNum.toFixed(2)
  }

  return (negative ? '-' : '') + formattedNum
}

export const NumberofTradesChart = () => {
  const theme = useTheme()
  const { address } = useParams()
  const { data } = useNumberOfTradesQuery(address || testParams.address)
  const [showSell, setShowSell] = useState(true)
  const [showBuy, setShowBuy] = useState(true)
  const [timeframe, setTimeframe] = useState('7D')
  const formattedData = useMemo(
    () =>
      (address ? data : NUMBER_OF_TRADES)?.map(item => {
        return {
          ...item,
          sell: showSell ? item.sell : undefined,
          buy: showBuy ? item.buy : undefined,
        }
      }),
    [data, showSell, showBuy, address],
  )
  const above768 = useMedia(`(min-width: ${MEDIA_WIDTHS.upToSmall}px)`)
  return (
    <>
      <ChartWrapper>
        <LegendWrapper>
          {above768 && (
            <>
              <LegendButton
                text="Buy"
                iconStyle={{ backgroundColor: rgba(theme.primary, 0.6) }}
                enabled={showBuy}
                onClick={() => setShowBuy(prev => !prev)}
              />
              <LegendButton
                text="Sell"
                iconStyle={{ backgroundColor: rgba(theme.red, 0.6) }}
                enabled={showSell}
                onClick={() => setShowSell(prev => !prev)}
              />
            </>
          )}
          <TimeFrameLegend selected={timeframe} onSelect={setTimeframe} timeframes={['1D', '7D', '1M', '3M']} />
        </LegendWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={500} height={300} data={formattedData} margin={{ top: 50 }}>
            <XAxis
              fontSize="12px"
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.subText, fontWeight: 400 }}
              tickFormatter={value => dayjs(value).format('MMM DD')}
            />
            <YAxis
              fontSize="12px"
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.subText, fontWeight: 400 }}
              width={40}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
              position={{ y: 120 }}
              animationDuration={100}
              content={props => {
                const payload = props.payload?.[0]?.payload
                if (!payload) return <></>
                return (
                  <TooltipWrapper>
                    <Text fontSize="10px" lineHeight="12px" color={theme.subText}>
                      {payload.timestamp && dayjs(payload.timestamp).format('MMM DD, YYYY')}
                    </Text>
                    <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                      Total Trades: <span style={{ color: theme.text }}>{formatNum(payload.buy + payload.sell)}</span>
                    </Text>
                    <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                      Buy: {formatNum(payload.buy)}
                    </Text>
                    <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                      Sell: {formatNum(payload.sell)}
                    </Text>
                  </TooltipWrapper>
                )
              }}
            />
            <Bar
              dataKey="sell"
              stackId="a"
              fill={rgba(theme.red, 0.6)}
              animationBegin={ANIMATION_DELAY}
              animationDuration={ANIMATION_DURATION}
            />
            <Bar
              dataKey="buy"
              stackId="a"
              fill={rgba(theme.primary, 0.6)}
              animationBegin={ANIMATION_DELAY}
              animationDuration={ANIMATION_DURATION}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
      {!above768 && (
        <Row justify="center" gap="16px">
          <LegendButton
            text="Buy"
            iconStyle={{ backgroundColor: rgba(theme.primary, 0.6) }}
            enabled={showBuy}
            onClick={() => setShowBuy(prev => !prev)}
          />
          <LegendButton
            text="Sell"
            iconStyle={{ backgroundColor: rgba(theme.red, 0.6) }}
            enabled={showSell}
            onClick={() => setShowSell(prev => !prev)}
          />
        </Row>
      )}
    </>
  )
}

export const TradingVolumeChart = () => {
  const theme = useTheme()
  const { address } = useParams()
  const { data } = useTradingVolumeQuery(address)
  const [timeframe, setTimeframe] = useState('7D')
  const filteredData = useMemo(() => {
    const datatemp = address ? data : TRADE_VOLUME
    return datatemp
  }, [data, address])

  return (
    <ChartWrapper>
      <LegendWrapper>
        <TimeFrameLegend selected={timeframe} onSelect={setTimeframe} timeframes={['1D', '7D', '1M', '3M']} />
      </LegendWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={500}
          height={400}
          data={filteredData}
          margin={{
            top: 50,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.primary} stopOpacity={0.8} />
              <stop offset="100%" stopColor={theme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            fontSize="12px"
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.subText, fontWeight: 400 }}
            tickFormatter={value => dayjs(value).format('MMM DD')}
          />
          <YAxis
            fontSize="12px"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.subText, fontWeight: 400 }}
            width={40}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            wrapperStyle={{ outline: 'none' }}
            position={{ y: 120 }}
            animationDuration={100}
            content={props => {
              const payload = props.payload?.[0]?.payload
              if (!payload) return <></>
              return (
                <TooltipWrapper>
                  <Text fontSize="10px" lineHeight="12px" color={theme.subText}>
                    {payload.timestamp && dayjs(payload.timestamp).format('MMM DD, YYYY')}
                  </Text>
                  <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                    Total Volume: <span style={{ color: theme.text }}>${formatNum(payload.buy + payload.sell)}</span>
                  </Text>
                  <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                    Buy: ${formatNum(payload.buy)}
                  </Text>
                  <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                    Sell: ${formatNum(payload.sell)}
                  </Text>
                </TooltipWrapper>
              )
            }}
          />
          <Bar
            dataKey="sell"
            stackId="a"
            fill={rgba(theme.red, 0.6)}
            animationBegin={ANIMATION_DELAY}
            animationDuration={ANIMATION_DURATION}
          />
          <Bar
            dataKey="buy"
            stackId="a"
            fill={rgba(theme.primary, 0.6)}
            animationBegin={ANIMATION_DELAY}
            animationDuration={ANIMATION_DURATION}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

export const NetflowToWhaleWallets = ({ tab }: { tab?: ChartTab }) => {
  const theme = useTheme()
  const { address } = useParams()
  const { data } = useNetflowToWhaleWalletsQuery(address || testParams.address)
  const { account } = useActiveWeb3React()
  const [showInflow, setShowInflow] = useState(true)
  const [showOutflow, setShowOutflow] = useState(true)
  const [showNetflow, setShowNetflow] = useState(true)
  const [timeframe, setTimeframe] = useState('7D')
  const formattedData = useMemo(
    () =>
      (address ? data : NETFLOW_TO_WHALE_WALLETS)?.map(item => {
        if (tab === ChartTab.Second) {
          return {
            inflow: showInflow ? item.inflow : undefined,
            netflow: showNetflow ? item.netflow : undefined,
            timestamp: item.timestamp,
          }
        }
        if (tab === ChartTab.Third) {
          return {
            outflow: showOutflow ? -item.outflow : undefined,
            netflow: showNetflow ? item.netflow : undefined,
            timestamp: item.timestamp,
          }
        }
        return {
          inflow: showInflow ? item.inflow : undefined,
          outflow: showOutflow ? -item.outflow : undefined,
          netflow: showNetflow ? item.netflow : undefined,
          timestamp: item.timestamp,
        }
      }),
    [data, showInflow, showOutflow, showNetflow, address, tab],
  )
  const above768 = useMedia(`(min-width: ${MEDIA_WIDTHS.upToSmall}px)`)

  return (
    <>
      <ChartWrapper>
        {account ? (
          <>
            <LegendWrapper>
              {above768 && (
                <>
                  <LegendButton
                    text="Inflow"
                    iconStyle={{ backgroundColor: rgba(theme.primary, 0.6) }}
                    enabled={showInflow}
                    onClick={() => setShowInflow(prev => !prev)}
                  />
                  <LegendButton
                    text="Outflow"
                    iconStyle={{ backgroundColor: rgba(theme.red, 0.6) }}
                    enabled={showOutflow}
                    onClick={() => setShowOutflow(prev => !prev)}
                  />
                  <LegendButton
                    text="Netflow"
                    iconStyle={{
                      height: '4px',
                      width: '16px',
                      borderRadius: '8px',
                      backgroundColor: rgba(theme.primary, 0.8),
                    }}
                    enabled={showNetflow}
                    onClick={() => setShowNetflow(prev => !prev)}
                  />
                </>
              )}
              <TimeFrameLegend selected={timeframe} onSelect={setTimeframe} timeframes={['1D', '7D', '1M', '3M']} />
            </LegendWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart width={500} height={300} data={formattedData} stackOffset="sign" margin={{ top: 50 }}>
                <XAxis
                  fontSize="12px"
                  dataKey="timestamp"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: theme.subText, fontWeight: 400 }}
                  tickFormatter={value => dayjs(value).format('MMM DD')}
                />
                <YAxis
                  fontSize="12px"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: theme.subText, fontWeight: 400 }}
                  width={40}
                />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  wrapperStyle={{ outline: 'none' }}
                  position={{ y: 120 }}
                  animationDuration={100}
                  content={props => {
                    const payload = props.payload?.[0]?.payload
                    if (!payload) return <></>
                    return (
                      <TooltipWrapper>
                        <Text fontSize="10px" lineHeight="12px" color={theme.subText}>
                          {payload.timestamp && dayjs(payload.timestamp).format('MMM DD, YYYY')}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                          Netflow: <span style={{ color: theme.text }}>${formatNum(payload.netflow)}</span>
                        </Text>
                        <Row gap="8px">
                          <Column gap="4px">
                            <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                              Wallet
                            </Text>
                            <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                              General Whales
                            </Text>
                            <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                              Token Whales
                            </Text>
                          </Column>
                          <Column gap="4px">
                            <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                              Inflow
                            </Text>
                            <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                              ${formatNum(payload.inflow)}
                            </Text>
                            <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                              ${formatNum(payload.inflow)}
                            </Text>
                          </Column>
                          <Column gap="4px">
                            <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                              Outflow
                            </Text>
                            <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                              ${formatNum(payload.outflow)}
                            </Text>
                            <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                              ${formatNum(payload.outflow)}
                            </Text>
                          </Column>
                        </Row>
                      </TooltipWrapper>
                    )
                  }}
                />
                <Bar
                  dataKey="inflow"
                  stackId="a"
                  fill={rgba(theme.primary, 0.6)}
                  animationBegin={ANIMATION_DELAY}
                  animationDuration={ANIMATION_DURATION}
                />
                <Bar
                  dataKey="outflow"
                  stackId="a"
                  fill={rgba(theme.red, 0.6)}
                  animationBegin={ANIMATION_DELAY}
                  animationDuration={ANIMATION_DURATION}
                />
                <Line type="linear" dataKey="netflow" stroke={theme.primary} strokeWidth={3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </>
        ) : (
          <></>
        )}
      </ChartWrapper>
      {!above768 && (
        <Row justify="center" gap="16px">
          <LegendButton
            text="Inflow"
            iconStyle={{ backgroundColor: rgba(theme.primary, 0.6) }}
            enabled={showInflow}
            onClick={() => setShowInflow(prev => !prev)}
          />
          <LegendButton
            text="Outflow"
            iconStyle={{ backgroundColor: rgba(theme.red, 0.6) }}
            enabled={showOutflow}
            onClick={() => setShowOutflow(prev => !prev)}
          />
          <LegendButton
            text="Netflow"
            iconStyle={{
              height: '4px',
              width: '16px',
              borderRadius: '8px',
              backgroundColor: rgba(theme.primary, 0.8),
            }}
            enabled={showNetflow}
            onClick={() => setShowNetflow(prev => !prev)}
          />
        </Row>
      )}
    </>
  )
}

export const NetflowToCentralizedExchanges = ({ tab }: { tab?: ChartTab }) => {
  const { data } = useNetflowToCEXQuery('123')
  const [showInflow, setShowInflow] = useState(true)
  const [showOutflow, setShowOutflow] = useState(true)
  const [showNetflow, setShowNetflow] = useState(true)
  const [timeframe, setTimeframe] = useState('7D')
  const formattedData = useMemo(
    () =>
      data?.map(item => {
        if (tab === ChartTab.Second) {
          return {
            inflow: showInflow ? item.inflow : undefined,
            netflow: showNetflow ? item.netflow : undefined,
            timestamp: item.timestamp,
          }
        }
        if (tab === ChartTab.Third) {
          return {
            outflow: showOutflow ? -item.outflow : undefined,
            netflow: showNetflow ? item.netflow : undefined,
            timestamp: item.timestamp,
          }
        }

        return {
          inflow: showInflow ? item.inflow : undefined,
          outflow: showOutflow ? -item.outflow : undefined,
          netflow: showNetflow ? item.netflow : undefined,
          timestamp: item.timestamp,
        }
      }),
    [data, showInflow, showOutflow, showNetflow, tab],
  )
  const theme = useTheme()
  const above768 = useMedia(`(min-width: ${MEDIA_WIDTHS.upToSmall}px)`)
  return (
    <>
      <ChartWrapper>
        <LegendWrapper>
          {above768 && (
            <>
              <LegendButton
                text="Inflow"
                iconStyle={{ backgroundColor: rgba(theme.primary, 0.6) }}
                enabled={showInflow}
                onClick={() => setShowInflow(prev => !prev)}
              />
              <LegendButton
                text="Outflow"
                iconStyle={{ backgroundColor: rgba(theme.red, 0.6) }}
                enabled={showOutflow}
                onClick={() => setShowOutflow(prev => !prev)}
              />
              <LegendButton
                text="Netflow"
                iconStyle={{
                  height: '4px',
                  width: '16px',
                  borderRadius: '8px',
                  backgroundColor: rgba(theme.primary, 0.8),
                }}
                enabled={showNetflow}
                onClick={() => setShowNetflow(prev => !prev)}
              />
            </>
          )}
          <TimeFrameLegend selected={timeframe} onSelect={setTimeframe} timeframes={['1D', '7D', '1M', '3M']} />
        </LegendWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            width={500}
            height={300}
            data={formattedData}
            stackOffset="sign"
            margin={{ top: 40, right: 30 }}
          >
            <XAxis
              fontSize="12px"
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.subText, fontWeight: 400 }}
              tickFormatter={value => dayjs(value).format('MMM DD')}
            />
            <YAxis
              fontSize="12px"
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.subText, fontWeight: 400 }}
              width={40}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              wrapperStyle={{ outline: 'none' }}
              position={{ y: 120 }}
              animationDuration={100}
              content={props => {
                const payload = props.payload?.[0]?.payload
                if (!payload) return <></>
                return (
                  <TooltipWrapper>
                    <Text fontSize="10px" lineHeight="12px" color={theme.subText}>
                      {payload.timestamp && dayjs(payload.timestamp).format('MMM DD, YYYY')}
                    </Text>
                    <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                      Netflow: <span style={{ color: theme.text }}>${formatNum(payload.netflow)}</span>
                    </Text>
                    <Row gap="8px">
                      <Column gap="4px">
                        <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                          Wallet
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                          Binance
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                          Coinbase
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                          OKX
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                          Kucoin
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                          Kraken
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                          Crypto.com
                        </Text>
                      </Column>
                      <Column gap="4px">
                        <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                          Inflow
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                          ${formatNum(payload.inflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                          ${formatNum(payload.inflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                          ${formatNum(payload.inflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                          ${formatNum(payload.inflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                          ${formatNum(payload.inflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.primary}>
                          ${formatNum(payload.inflow)}
                        </Text>
                      </Column>
                      <Column gap="4px">
                        <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                          Outflow
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                          ${formatNum(payload.outflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                          ${formatNum(payload.outflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                          ${formatNum(payload.outflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                          ${formatNum(payload.outflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                          ${formatNum(payload.outflow)}
                        </Text>
                        <Text fontSize="12px" lineHeight="16px" color={theme.red}>
                          ${formatNum(payload.outflow)}
                        </Text>
                      </Column>
                    </Row>
                  </TooltipWrapper>
                )
              }}
            />
            <Bar
              dataKey="inflow"
              stackId="a"
              fill={rgba(theme.primary, 0.6)}
              animationBegin={ANIMATION_DELAY}
              animationDuration={ANIMATION_DURATION}
            />
            <Bar
              dataKey="outflow"
              stackId="a"
              fill={rgba(theme.red, 0.6)}
              animationBegin={ANIMATION_DELAY}
              animationDuration={ANIMATION_DURATION}
            />
            <Line type="linear" dataKey="netflow" stroke={theme.primary} strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartWrapper>
      {!above768 && (
        <Row justify="center" gap="16px">
          <LegendButton
            text="Inflow"
            iconStyle={{ backgroundColor: rgba(theme.primary, 0.6) }}
            enabled={showInflow}
            onClick={() => setShowInflow(prev => !prev)}
          />
          <LegendButton
            text="Outflow"
            iconStyle={{ backgroundColor: rgba(theme.red, 0.6) }}
            enabled={showOutflow}
            onClick={() => setShowOutflow(prev => !prev)}
          />
          <LegendButton
            text="Netflow"
            iconStyle={{
              height: '4px',
              width: '16px',
              borderRadius: '8px',
              backgroundColor: rgba(theme.primary, 0.8),
            }}
            enabled={showNetflow}
            onClick={() => setShowNetflow(prev => !prev)}
          />
        </Row>
      )}
    </>
  )
}

export const NumberofTransfers = ({ tab }: { tab: ChartTab }) => {
  const theme = useTheme()
  const { address } = useParams()
  const { data } = useNumberOfTransfersQuery(address)
  const [timeframe, setTimeframe] = useState('7D')
  const filteredData = useMemo(() => {
    const d = address ? data : NUMBER_OF_TRANSFERS
    switch (timeframe) {
      case '1D':
      case '7D':
        return d && d.length >= 8 ? d?.slice(d.length - 8, d.length - 1) : d
      default:
        return d
    }
  }, [data, timeframe, address])

  return (
    <ChartWrapper>
      <LegendWrapper>
        <TimeFrameLegend selected={timeframe} onSelect={setTimeframe} timeframes={['1D', '7D', '1M', '3M']} />
      </LegendWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={filteredData}
          margin={{
            top: 40,
            right: 0,
            left: 20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.primary} stopOpacity={0.8} />
              <stop offset="100%" stopColor={theme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            fontSize="12px"
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.subText, fontWeight: 400 }}
            tickFormatter={value => dayjs(value).format('MMM DD')}
          />
          <YAxis
            fontSize="12px"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.subText, fontWeight: 400 }}
            width={40}
            tickFormatter={value => formatNum(value)}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            wrapperStyle={{ outline: 'none' }}
            position={{ y: 120 }}
            animationDuration={100}
            content={props => {
              const payload = props.payload?.[0]?.payload
              if (!payload) return <></>
              return (
                <TooltipWrapper>
                  <Text fontSize="10px" lineHeight="12px" color={theme.subText}>
                    {payload.timestamp && dayjs(payload.timestamp).format('MMM DD, YYYY')}
                  </Text>
                  <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                    {tab === ChartTab.Second ? 'Total Volume' : 'Total Transfers'}:{' '}
                    <span style={{ color: theme.text }}>{formatNum(payload.count)}</span>
                  </Text>
                </TooltipWrapper>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={theme.primary}
            fill="url(#colorUv)"
            animationBegin={ANIMATION_DELAY}
            animationDuration={ANIMATION_DURATION}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

export const NumberofHolders = () => {
  const theme = useTheme()
  const { address } = useParams()
  const { data } = useNumberOfHoldersQuery(address)
  const [timeframe, setTimeframe] = useState('7D')
  const filteredData = useMemo(() => {
    const d = address ? data : NUMBER_OF_HOLDERS
    switch (timeframe) {
      case '1D':
      case '7D':
        return d && d.length >= 8 ? d?.slice(d.length - 8, d.length - 1) : d
      default:
        return d
    }
  }, [data, timeframe, address])

  return (
    <ChartWrapper>
      <LegendWrapper>
        <TimeFrameLegend selected={timeframe} onSelect={setTimeframe} timeframes={['7D', '1M', '3M', '6M']} />
      </LegendWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          width={500}
          height={400}
          data={filteredData}
          margin={{
            top: 40,
            right: 0,
            left: 20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.primary} stopOpacity={0.8} />
              <stop offset="100%" stopColor={theme.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            fontSize="12px"
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.subText, fontWeight: 400 }}
            tickFormatter={value => dayjs(value).format('MMM DD')}
          />
          <YAxis
            fontSize="12px"
            tickLine={false}
            axisLine={false}
            tick={{ fill: theme.subText, fontWeight: 400 }}
            width={40}
            tickFormatter={value => formatNum(value)}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            wrapperStyle={{ outline: 'none' }}
            position={{ y: 120 }}
            animationDuration={100}
            content={props => {
              const payload = props.payload?.[0]?.payload
              if (!payload) return <></>
              return (
                <TooltipWrapper>
                  <Text fontSize="10px" lineHeight="12px" color={theme.subText}>
                    {payload.timestamp && dayjs(payload.timestamp).format('MMM DD, YYYY')}
                  </Text>
                  <Text fontSize="12px" lineHeight="16px" color={theme.text}>
                    Holders: <span style={{ color: theme.text }}>{formatNum(payload.count)}</span>
                  </Text>
                </TooltipWrapper>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={theme.primary}
            fill="url(#colorUv)"
            animationBegin={ANIMATION_DELAY}
            animationDuration={ANIMATION_DURATION}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

const data01 = [
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 400 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 300 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 300 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 200 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 278 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 200 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 100 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
  { name: '0x9E6A9b73C0603ea78aD24Efe0368Df8F95a43651', value: 189 },
]

const COLORS = ['#00a2f7', '#31CB9E', '#FFBB28', '#F3841E', '#FF537B', '#27AE60', '#78d5ff', '#8088E5']
const CustomLabel = ({ x, y, cx, cy, name }: any) => {
  let customY = y
  if (Math.abs(cx - x) < 30) {
    customY = cy - y > 0 ? y - 8 : y + 8
  }
  return (
    <text x={x} y={customY} textAnchor={x > cx ? 'start' : 'end'} fill="#31CB9E" fontSize={12}>
      {name}
    </text>
  )
}
export const HoldersChartWrapper = () => {
  const theme = useTheme()
  const above1000 = useMedia('(min-width:1000px)')

  const formattedData = useMemo(
    () =>
      above1000
        ? data01
        : data01.map(item => {
            return { ...item, name: shortenAddress(1, item.name) }
          }),
    [above1000],
  )

  return (
    <ChartWrapper>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={100} height={100} margin={{ top: 20, right: 90, bottom: 20, left: 90 }}>
          <Tooltip
            cursor={{ fill: 'transparent' }}
            wrapperStyle={{ outline: 'none' }}
            animationDuration={100}
            content={props => {
              const payload = props.payload?.[0]?.payload
              if (!payload) return <></>
              return (
                <TooltipWrapper>
                  <Text fontSize="12px" lineHeight="16px" color={theme.subText}>
                    Supply Owned: {(payload.value / 30).toFixed(2)}%
                  </Text>
                </TooltipWrapper>
              )
            }}
          />
          <Pie
            dataKey="value"
            label={CustomLabel}
            nameKey="name"
            data={formattedData}
            innerRadius="40%"
            outerRadius="80%"
            animationBegin={ANIMATION_DELAY}
            animationDuration={ANIMATION_DURATION}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] + 'e0'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  )
}

export const LiquidOnCentralizedExchanges = ({ style }: { style?: React.CSSProperties }) => {
  const [timeframe, setTimeframe] = useState('7D')
  return (
    <ChartWrapper style={style}>
      <LegendWrapper>
        <ShortLegend />
        <LongLegend />
        <PriceLegend />
        <TimeFrameLegend selected={timeframe} onSelect={setTimeframe} timeframes={['1D', '7D', '1M']} />
      </LegendWrapper>
      <SignedBarChart />
    </ChartWrapper>
  )
}

// const LOCALSTORAGE_STATE_NAME = 'proChartState'

const ProLiveChartWrapper = styled.div<{ fullscreen: boolean }>`
  height: ${isMobile ? '100%' : 'calc(100% - 0px)'};
  ${({ theme }) => `border: 1px solid ${theme.background};`}
  overflow: hidden;
  box-shadow: 0px 4px 16px rgb(0 0 0 / 4%);
  border-radius: ${isMobile ? '0' : '10px'};

  ${({ fullscreen }) =>
    fullscreen &&
    !isMobile &&
    `
    background-color: rgb(0,0,0,0.5);
    position: fixed;
    top: -15px;
    left: 0;
    padding-top: 82px;
    height: 100%!important;
    width: 100%!important;
    border-radius: 0;
    margin:0;
  `}
`

const Prochart = ({ poolDetail }: { poolDetail: PoolResponse }) => {
  const theme = useTheme()
  const [ref, setRef] = useState<HTMLDivElement | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  const datafeed = useDatafeed(poolDetail, '1337609')

  useEffect(() => {
    if (!ref || !window.TradingView) {
      return
    }
    //setLoading(true)

    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: 'BTC',
      datafeed: datafeed,
      interval: '1H' as ResolutionString,
      container: ref,
      library_path: '/charting_library/',
      disabled_features: [
        'header_symbol_search',
        'header_fullscreen_button',
        'header_compare',
        'header_saveload',
        'drawing_templates',
      ],
      enabled_features: [
        'study_templates',
        'create_volume_indicator_by_default',
        'use_localstorage_for_settings',
        'save_chart_properties_to_local_storage',
      ],
      fullscreen: false,
      autosize: true,
      studies_overrides: {},
      theme: theme.darkMode ? 'Dark' : 'Light',
      custom_css_url: '/charting_library/style.css',
      timeframe: '2w',
      time_frames: [
        { text: '6m', resolution: '4H' as ResolutionString, description: '6 Months' },
        { text: '1m', resolution: '1H' as ResolutionString, description: '1 Month' },
        { text: '2w', resolution: '1H' as ResolutionString, description: '2 Weeks' },
        { text: '1w', resolution: '1H' as ResolutionString, description: '1 Week' },
        { text: '1d', resolution: '15' as ResolutionString, description: '1 Day' },
      ],
      locale: 'vi',
    }
    const tvWidget = new window.TradingView.widget(widgetOptions)

    tvWidget.onChartReady(() => {
      tvWidget.applyOverrides({
        'paneProperties.backgroundType': 'solid',
        'paneProperties.background': theme.darkMode ? theme.buttonBlack : theme.background,
        'mainSeriesProperties.candleStyle.upColor': theme.primary,
        'mainSeriesProperties.candleStyle.borderUpColor': theme.primary,
        'mainSeriesProperties.candleStyle.wickUpColor': theme.primary,
        'mainSeriesProperties.candleStyle.downColor': theme.red,
        'mainSeriesProperties.candleStyle.borderDownColor': theme.red,
        'mainSeriesProperties.candleStyle.wickDownColor': theme.red,
        'mainSeriesProperties.priceAxisProperties.autoScale': true,
        'scalesProperties.textColor': theme.text,
      })
      tvWidget.activeChart().createStudy('Stochastic RSI')
    })

    return () => {
      if (tvWidget !== null) {
        tvWidget.remove()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, ref])

  return (
    <ProLiveChartWrapper fullscreen={fullscreen} onClick={() => setFullscreen(false)}>
      <div
        ref={newRef => setRef(newRef)}
        style={{ height: '100%', width: '100%', display: 'block' }}
        onClick={(e: any) => {
          e.stopPropagation()
        }}
      />
    </ProLiveChartWrapper>
  )
}
export const PriceChart = () => {
  const { data: poolDetail } = useGetPoolDetailQuery(
    { poolAddress: '0x99ac8ca7087fa4a2a1fb6357269965a2014abc35', network: 'eth' },
    {
      skip: !'0x99ac8ca7087fa4a2a1fb6357269965a2014abc35',
    },
  )
  console.log('🚀 ~ file: index.tsx:1315 ~ PriceChart ~ poolDetail', poolDetail)
  if (!poolDetail) return <></>

  return <Prochart poolDetail={poolDetail}></Prochart>
}
