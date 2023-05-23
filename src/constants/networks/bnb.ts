import { ChainId } from '@kyberswap/ks-sdk-core'

import BnbLogo from 'assets/images/bnb-logo.png'
import BSC from 'assets/networks/bsc-network.png'
import { KS_SETTING_API } from 'constants/env'
import { EVMNetworkInfo } from 'constants/networks/type'

const EMPTY = ''
const NOT_SUPPORT = null

const bnbInfo: EVMNetworkInfo = {
  chainId: ChainId.BSCMAINNET,
  route: 'bnb',
  ksSettingRoute: 'bsc',
  priceRoute: 'bsc',
  poolFarmRoute: 'bsc',
  aggregatorRoute: 'bsc',
  name: 'BNB Chain',
  icon: BSC,
  iconDark: NOT_SUPPORT,
  iconSelected: NOT_SUPPORT,
  iconDarkSelected: NOT_SUPPORT,
  defaultBlockSubgraph: 'https://api.thegraph.com/subgraphs/name/dynamic-amm/ethereum-blocks-bsc',
  etherscanUrl: 'https://bscscan.com',
  etherscanName: 'BscScan',
  tokenListUrl: `${KS_SETTING_API}/v1/tokens?chainIds=${ChainId.BSCMAINNET}&isWhitelisted=${true}`,
  bridgeURL: EMPTY,
  nativeToken: {
    symbol: 'BNB',
    name: 'BNB',
    logo: BnbLogo,
    decimal: 18,
    minForGas: 10 ** 16,
  },
  defaultRpcUrl: 'https://bsc.kyberengineering.io',
  multicall: '0xed386Fe855C1EFf2f843B910923Dd8846E45C5A4',
  classic: {
    defaultSubgraph: 'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-exchange-bsc',
    static: {
      zap: '0x2abE8750e4a65584d7452316356128C936273e0D',
      router: '0x5649B4DD00780e99Bab7Abb4A3d581Ea1aEB23D0',
      factory: '0x1c758aF0688502e49140230F6b0EBd376d429be5',
    },
    oldStatic: NOT_SUPPORT,
    dynamic: {
      zap: '0x83D4908c1B4F9Ca423BEE264163BC1d50F251c31',
      router: '0x78df70615ffc8066cc0887917f2Cd72092C86409',
      factory: '0x878dFE971d44e9122048308301F540910Bbd934c',
    },
    claimReward: NOT_SUPPORT,
    fairlaunch: [
      '0x597e3FeDBC02579232799Ecd4B7edeC4827B0435',
      '0x3D88bDa6ed7dA31E15E86A41CA015Ea50771448E',
      '0x829c27fd3013b944cbE76E92c3D6c45767c0C789',
      '0xc49b3b43565b76E5ba7A98613263E7bFdEf1140c',
      '0xcCAc8DFb75120140A5469282a13E9A60B1751276',
      '0x31De05f28568e3d3D612BFA6A78B356676367470',
    ],
    fairlaunchV2: ['0x8c312c9721c53a2e0bb11b3b0fc1742f6861bd4f', '0x3474b537da4358A08f916b1587dccdD9585376A4'],
  },
  elastic: {
    defaultSubgraph: 'https://api.thegraph.com/subgraphs/name/kybernetwork/kyberswap-elastic-bsc',
    startBlock: 28227552,
    coreFactory: '0x3404dadd434F04161A463138010318b637C4E73d',
    nonfungiblePositionManager: '0xD107109C83263862Af52FF3d5601E868DbFF25DE',
    tickReader: '0x816D47bCB13f9CE3fcDd7c2cDd036F50B683aeeA',
    initCodeHash: '0x00e263aaa3a2c06a89b53217a9e7aad7e15613490a72e0f95f303c4de2dc7045',
    quoter: '0x12AD3d673503CD6bA7374cb59B1c1b34A7fA9105',
    routers: '0x0199635cc88c6064E7c514f3a97BC35B176Bd6E7',
    farms: ['0xf945cAa0734a35fD9067F9e603B2e3cbc59D05ef'],
  },
  limitOrder: {
    development: '0x26279604204aa9D3B530bcd8514fc4276bf0962C',
    production: '0x227B0c196eA8db17A665EA6824D972A64202E936',
  },
  averageBlockTimeInSeconds: 3,
  coingeckoNetworkId: 'binance-smart-chain',
  coingeckoNativeTokenId: 'binancecoin',
  deBankSlug: 'bsc',
  trueSightId: 'bsc',
  dexToCompare: 'pancake',
  geckoTermialId: 'bsc',
}

export default bnbInfo
