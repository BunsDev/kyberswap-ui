import { t } from '@lingui/macro'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Text } from 'rebass'
import styled, { useTheme } from 'styled-components'

import { ButtonPrimary } from 'components/Button'
import Icon from 'components/Icons/Icon'
import Row, { RowFit } from 'components/Row'

import { SectionWrapper } from '../components'
import CexRekt from '../components/CexRekt'
import { LiquidOnCentralizedExchanges, PriceChart } from '../components/chart'
import { FundingRateTable, LiveDEXTrades, SupportResistanceLevel } from '../components/table'
import { ChartTab } from '../types'

const Wrapper = styled.div`
  padding: 20px 0;
  width: 100%;
`

export default function TechnicalAnalysis() {
  const theme = useTheme()

  const [liveChartTab, setLiveChartTab] = useState(ChartTab.First)
  const navigate = useNavigate()
  return (
    <Wrapper>
      <SectionWrapper
        show={true}
        fullscreenButton
        tabs={[`BTC/USD`, `BTC/BTC`]}
        activeTab={liveChartTab}
        onTabClick={setLiveChartTab}
        style={{ height: '700px' }}
      >
        <PriceChart />
      </SectionWrapper>
      <SectionWrapper
        show={true}
        title={t`Support & Resistance Levels`}
        description={t`Support level is where the price of a token normally stops falling and bounces back from. Resistance level is where the price of a token normally stops rising and dips back down. Support and resistance levels may vary depending on the timeframe you’re looking at. `}
        style={{ height: 'fit-content' }}
      >
        <SupportResistanceLevel />
        <Row justify="flex-end">
          <ButtonPrimary width="fit-content" onClick={() => navigate('/limit/ethereum/wbtc-to-usdt')}>
            <Text color={theme.textReverse} fontSize="14px" lineHeight="20px">
              <RowFit gap="4px">
                <Icon id="chart" size={16} /> Place Limit Order
              </RowFit>
            </Text>
          </ButtonPrimary>
        </Row>
      </SectionWrapper>
      <SectionWrapper
        show={true}
        id={'fundingrate'}
        title={t`Funding Rate on Centralized Exchanges`}
        description={`Funding rate is useful in identifying short-term trends.
        <span style={{ color: ${theme.primary}, fontStyle: 'italic' }}>Positive</span> funding rates suggests traders are
        bullish. Extremely positive funding rates may result in long positions getting squeezed. Negative funding
        rates suggests traders are bearish. Extremely negative funding rates may result in short positions getting
        squeezed.`}
        style={{ height: 'fit-content' }}
      >
        <FundingRateTable />
      </SectionWrapper>
      <SectionWrapper title={t`Live Trades`} style={{ height: 'fit-content' }}>
        <LiveDEXTrades />
      </SectionWrapper>
      <SectionWrapper
        title={t`Liquidations on Centralized Exchanges`}
        description={`Liquidations describe the forced closing of a trader&apos;s futures position due to the partial or total loss
          of their collateral. This happens when a trader has insufficient funds to keep a leveraged trade
          open.Leverated trading is high risk & high reward. The higher the leverage, the easier it is for a trader to
          get liquidated. An abrupt change in price of a token can cause large liquidations. Traders may buy / sell the
          token after large liquidations.`}
        style={{ height: '600px' }}
      >
        <LiquidOnCentralizedExchanges />
        <CexRekt />
      </SectionWrapper>
    </Wrapper>
  )
}
