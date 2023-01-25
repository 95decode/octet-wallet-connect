import { EIP155_CHAINS, EIP155_SIGNING_METHODS, TEIP155Chain } from '@/data/EIP155Data'
import { eip155Addresses, eip155Wallets } from '@/utils/EIP155WalletUtil'
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils'
import { SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { ethers, providers } from 'ethers'
import {
  getSignParamsMessage,
  getSignTypedDataParamsData,
  getWalletAddressFromParams
} from '@/utils/HelperUtil'
import { 
  octetSignTypedData, 
  octetSignedDataQuery, 
  octetSignMessage, 
  octetSignTransaction, 
  octetSignedTxQuery, 
  octetSendSignedTx 
} from '@/utils/OctetUtil'

// For delay test
const wait = (timeToDelay: number) => new Promise((resolve) => setTimeout(resolve, timeToDelay))

export async function approveEIP155Request(
  requestEvent: SignClientTypes.EventArguments['session_request']
) {
  const { params, id } = requestEvent
  const { chainId, request } = params
  const wallet = eip155Wallets[getWalletAddressFromParams(eip155Addresses, params)]

  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      const message = getSignParamsMessage(request.params)

      if(!wallet.octet.status) {
        const signedMessage = await wallet.signMessage(message)
        return formatJsonRpcResult(id, signedMessage)
      } else {
        const uuid = await octetSignMessage(message, wallet.getAddress())
        // Wait for Octet scheduler
        await wait(1000)

        let signedMessage = await octetSignedDataQuery(uuid)

        if(signedMessage === "FAIL") {
          await wait(1000)
          signedMessage = await octetSignedDataQuery(uuid)
        }
        
        return formatJsonRpcResult(id, signedMessage)
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      if(!wallet.octet.status) {
        const { domain, types, message: data } = getSignTypedDataParamsData(request.params)
        delete types.EIP712Domain
        const signedData = await wallet._signTypedData(domain, types, data)
        return formatJsonRpcResult(id, signedData)
      } else {
        const { domain, types, primaryType, message: data } = getSignTypedDataParamsData(request.params)
        const typedData = {
          types,
          domain,
          primaryType,
          message: data
        }
        
        const uuid = await octetSignTypedData(typedData, wallet.getAddress())
        // Wait for Octet scheduler
        await wait(1000)
        let signedData = await octetSignedDataQuery(uuid)

        if(signedData === "FAIL") {
          await wait(1000)
          signedData = await octetSignedDataQuery(uuid)
        }

        return formatJsonRpcResult(id, signedData)
      }

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      const sendTransaction = request.params[0]

      if(!wallet.octet.status) {
        const provider = new providers.JsonRpcProvider(EIP155_CHAINS[chainId as TEIP155Chain].rpc)
        const connectedWallet = wallet.connect(provider)
        const { hash } = await connectedWallet.sendTransaction(sendTransaction)
        return formatJsonRpcResult(id, hash)
      } else {
        delete sendTransaction.from
        const serializedTx = ethers.utils.serializeTransaction(sendTransaction).slice(2)
        const uuid = await octetSignTransaction(serializedTx, wallet.getAddress())
        // Wait for Octet scheduler
        await wait(1000)
        let signedTx = await octetSignedTxQuery(uuid)

        if(signedTx === "FAIL") {
          await wait(1000)
          signedTx = await octetSignedTxQuery(uuid)
        }

        await wait(1000)
        let txid = await octetSendSignedTx(signedTx)

        if(txid === "FAIL") {
          await wait(1000)
          txid = await octetSendSignedTx(signedTx)
        }

        return formatJsonRpcResult(id, txid)
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      const signTransaction = request.params[0]

      if(!wallet.octet.status) {
        const signature = await wallet.signTransaction(signTransaction)
        return formatJsonRpcResult(id, signature)
      } else {
        delete signTransaction.from
        const serializedTx = ethers.utils.serializeTransaction(signTransaction).slice(2)
        const uuid = await octetSignTransaction(serializedTx, wallet.getAddress())
        // Wait for Octet scheduler
        await wait(1000)
        let signedTx = await octetSignedTxQuery(uuid)

        if(signedTx === "FAIL") {
          await wait(1000)
          signedTx = await octetSignedTxQuery(uuid)
        }

        return formatJsonRpcResult(id, signedTx)
      }

    default:
      throw new Error(getSdkError('INVALID_METHOD').message)
  }
}

export function rejectEIP155Request(request: SignClientTypes.EventArguments['session_request']) {
  const { id } = request

  return formatJsonRpcError(id, getSdkError('USER_REJECTED_METHODS').message)
}