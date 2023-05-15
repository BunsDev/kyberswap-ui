import { ChainId } from '@kyberswap/ks-sdk-core'
import { createAction } from '@reduxjs/toolkit'

export const selectChains = createAction<ChainId[]>('myEarnings/selectChains')
export const toggleShowClosedPositions = createAction('myEarnings/toggleShowClosedPositions')
export const setSearchText = createAction<string>('myEarnings/setSearchText')
export const expandAllPools = createAction('myEarnings/expandAllPools')
export const collapseAllPools = createAction('myEarnings/collapseAllPools')
