import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, TokenAmount } from '@kyberswap/ks-sdk-core'
import { t } from '@lingui/macro'
import JSBI from 'jsbi'
import { useCallback, useMemo } from 'react'

import { NotificationType } from 'components/Announcement/type'
import { useTokenAllowance } from 'data/Allowances'
import { useNotify } from 'state/application/hooks'
import { Field } from 'state/swap/actions'
import { useHasPendingApproval, useTransactionAdder } from 'state/transactions/hooks'
import { TRANSACTION_TYPE } from 'state/transactions/type'
import { calculateGasMargin } from 'utils'
import { Aggregator } from 'utils/aggregator'
import { friendlyError } from 'utils/errorMessage'
import { computeSlippageAdjustedAmounts } from 'utils/prices'

import { useActiveWeb3React } from './index'
import { useTokenContract } from './useContract'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED,
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string,
  forceApprove = false,
): [ApprovalState, () => Promise<void>, TokenAmount | undefined] {
  const { account, isSolana } = useActiveWeb3React()
  const token = amountToApprove?.currency.wrapped
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)
  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (isSolana) return ApprovalState.APPROVED // Solana do approve when actual swap
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // Handle farm approval.
    if (amountToApprove.quotient.toString() === MaxUint256.toString()) {
      return currentAllowance.equalTo(JSBI.BigInt(0))
        ? pendingApproval
          ? ApprovalState.PENDING
          : ApprovalState.NOT_APPROVED
        : ApprovalState.APPROVED
    }

    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, isSolana, pendingApproval, spender])
  const notify = useNotify()

  const tokenContract = useTokenContract(token?.address)
  const addTransactionWithType = useTransactionAdder()

  const approve = useCallback(
    async (customAmount?: CurrencyAmount<Currency>): Promise<void> => {
      if (approvalState !== ApprovalState.NOT_APPROVED && !forceApprove) {
        console.error('approve was called unnecessarily')
        return
      }
      if (!token) {
        console.error('no token')
        return
      }

      if (!tokenContract) {
        console.error('tokenContract is null')
        return
      }

      if (!amountToApprove) {
        console.error('missing amount to approve')
        return
      }

      if (!spender) {
        console.error('no spender')
        return
      }

      let estimatedGas
      let approvedAmount
      try {
        if (customAmount instanceof CurrencyAmount) {
          estimatedGas = await tokenContract.estimateGas.approve(spender, customAmount)
          approvedAmount = customAmount
        } else {
          estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256)
          approvedAmount = MaxUint256
        }
      } catch (e) {
        try {
          estimatedGas = await tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
          approvedAmount = amountToApprove.quotient.toString()
        } catch {
          estimatedGas = await tokenContract.estimateGas.approve(spender, '0')
          return tokenContract.approve(spender, '0', {
            gasLimit: calculateGasMargin(estimatedGas),
          })
        }
      }

      return tokenContract
        .approve(spender, approvedAmount, {
          gasLimit: calculateGasMargin(estimatedGas),
        })
        .then((response: TransactionResponse) => {
          addTransactionWithType({
            hash: response.hash,
            type: TRANSACTION_TYPE.APPROVE,
            extraInfo: {
              tokenSymbol: token.symbol ?? '',
              tokenAddress: token.address,
              contract: spender,
            },
          })
        })
        .catch((error: Error) => {
          const message = friendlyError(error)
          console.error('Approve token error:', { message, error })
          notify(
            {
              title: t`Approve Error`,
              summary: message,
              type: NotificationType.ERROR,
            },
            8000,
          )
          throw error
        })
    },
    [approvalState, token, tokenContract, amountToApprove, spender, addTransactionWithType, forceApprove, notify],
  )

  return [approvalState, approve, currentAllowance]
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTradeV2(
  trade?: Aggregator,
  allowedSlippage = 0,
): [ApprovalState, () => Promise<void>, TokenAmount | undefined] {
  const amountToApprove = useMemo(
    () => (trade ? computeSlippageAdjustedAmounts(trade, allowedSlippage)[Field.INPUT] : undefined),
    [trade, allowedSlippage],
  )

  return useApproveCallback(amountToApprove, trade?.routerAddress)
}
