import { providers, Wallet } from 'ethers'

/**
 * Types
 */
interface IInitArgs {
  mnemonic?: string
}

/**
 * Library
 */
export default class EIP155Lib {
  wallet: Wallet
  octet: boolean

  constructor(wallet: Wallet) {
    this.wallet = wallet
    this.octet = false
  }

  static init({ mnemonic }: IInitArgs) {
    const wallet = mnemonic ? Wallet.fromMnemonic(mnemonic) : Wallet.createRandom()

    return new EIP155Lib(wallet)
  }

  getMnemonic() {
    const res = this.octet 
    ? "Octet does not export mnemoic phrase." 
    : this.wallet.mnemonic.phrase
    return res
  }

  getAddress() {
    return this.wallet.address
  }

  signMessage(message: string) {
    return this.wallet.signMessage(message)
  }

  _signTypedData(domain: any, types: any, data: any) {
    return this.wallet._signTypedData(domain, types, data)
  }

  connect(provider: providers.JsonRpcProvider) {
    return this.wallet.connect(provider)
  }

  signTransaction(transaction: providers.TransactionRequest) {
    return this.wallet.signTransaction(transaction)
  }
}
