import { ChainId, Currency, Token } from '@kyberswap/ks-sdk-core'
import { parse } from 'querystring'

import { NETWORKS_INFO, SUPPORTED_NETWORKS } from 'constants/networks'

/**
 * ex:  nguyen hoai danh => nguyen-hoai-danh
 * @param text
 * @returns
 */
export function convertToSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/ +/g, '-')
    .replace(/[^\w-.]+/g, '')
}

export const getSymbolSlug = (token: Currency | Token | undefined) =>
  token ? convertToSlug(token?.symbol || token?.wrapped?.symbol || '') : ''

export const queryStringToObject = (queryString: string) => {
  return parse(queryString.startsWith('?') ? queryString.substring(1) : queryString)
}

export const isInEnum = <T extends Record<string, string>>(str: string, enumParam: T): str is T[keyof T] => {
  return Object.values(enumParam).includes(str)
}

// hello world => hello...
export const shortString = (str: string | undefined, n: number) => {
  if (!str) return ''
  return str.length <= n ? str : str.substring(0, n) + '...'
}

export const escapeScriptHtml = (str: string) => {
  return str.replace(/<.*?script.*?>.*?<\/.*?script.*?>/gim, '')
}

export const isEmailValid = (value: string | undefined) => value?.match(/^\w+([\.-]?\w)*@\w+([\.-]?\w)*(\.\w{2,10})+$/)

export const getChainIdFromSlug = (network: string | undefined): ChainId | undefined => {
  return SUPPORTED_NETWORKS.find(chainId => NETWORKS_INFO[chainId].route === network)
}
