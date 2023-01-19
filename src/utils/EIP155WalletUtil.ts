import EIP155Lib from '@/lib/EIP155Lib'
import axios from 'axios'

export let wallet1: EIP155Lib
export let wallet2: EIP155Lib
export let wallet3: EIP155Lib
export let eip155Wallets: Record<string, EIP155Lib>
export let eip155Addresses: string[]

let address1: string
let address2: string
let address3: string

/**
 * Utilities
 */
export async function createOrRestoreEIP155Wallet() {
  const mnemonic1 = localStorage.getItem('EIP155_MNEMONIC_1')
  const mnemonic2 = localStorage.getItem('EIP155_MNEMONIC_2')

  if (mnemonic1 && mnemonic2) {
    wallet1 = EIP155Lib.init({ mnemonic: mnemonic1 })
    wallet2 = EIP155Lib.init({ mnemonic: mnemonic2 })
  } else {
    wallet1 = EIP155Lib.init({})
    wallet2 = EIP155Lib.init({})

    // Don't store mnemonic in local storage in a production project!
    localStorage.setItem('EIP155_MNEMONIC_1', wallet1.getMnemonic())
    localStorage.setItem('EIP155_MNEMONIC_2', wallet2.getMnemonic())
  }

  wallet3 = EIP155Lib.init({})
  wallet3.octet = true

  address1 = wallet1.getAddress()
  address2 = wallet2.getAddress()

  // For test
  const octetId = process.env.NEXT_PUBLIC_OCTET_WALLET_ID
  const octetKey = process.env.NEXT_PUBLIC_OCTET_API_KEY

  const options = {
    method: 'GET',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/child-addresses?pos=0&offset=1&order=desc`,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${octetKey}`
    }
  };

  await axios
  .request(options)
  .then(function (response) {
    address3 = response.data[0].address
  })
  .catch(function (error) {
    console.error(error)
  });

  eip155Wallets = {
    [address1]: wallet1,
    [address2]: wallet2,
    [address3]: wallet3,
  }

  eip155Addresses = Object.keys(eip155Wallets)

  return {
    eip155Wallets,
    eip155Addresses
  }
}
