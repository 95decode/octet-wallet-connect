import axios from 'axios'

const octetId = process.env.NEXT_PUBLIC_OCTET_WALLET_ID
const octetKey = process.env.NEXT_PUBLIC_OCTET_API_KEY

export async function octetGetAddress(): Promise<string> {
  const options = {
    method: 'GET',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/child-addresses?pos=0&offset=1&order=desc`,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${octetKey}`
    }
  }

  const res = await axios.request(options)

  return res.data[0].address
}

export async function octetSignMessage(message: string, address: string): Promise<string> {
  const options = {
    method: 'POST',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/data/sign`,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${octetKey}`,
      'content-type': 'application/json'
    },
    data: {
      data: message,
      type: 'EIP191',
      address: address
    }
  }

  const res = await axios.request(options)

  return res.data.uuid
}

export async function octetSignTypedData(typedData: any, address: string): Promise<string> {
  const options = {
    method: 'POST',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/data/sign`,
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${octetKey}`,
        'content-type': 'application/json'
    },
    data: {
      data: typedData,
      type: 'EIP712',
      address: address
    }
  }

  const res = await axios.request(options)

  return res.data.uuid
}

export async function octetSignTransaction(serializedTx: string, address: string): Promise<string> {
  const options = {
    method: 'POST',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/transactions/sign`,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${octetKey}`,
      'content-type': 'application/json'
    },
    data: {
      address: address, 
      serializedUnsignedTransaction: serializedTx
    }
  }

  const res = await axios.request(options)
  
  return res.data.uuid
}

export async function octetSendSignedTx(signedTx: string): Promise<string> {
  const options = {
    method: 'POST',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/transactions/send`,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${octetKey}`,
      'content-type': 'application/json'
    },
    data: {
      serializedSignedTransaction: signedTx
    }
  }

  const res = await axios.request(options)

  return Object.keys(res.data).includes("errorCode") ? "FAIL" : res.data.txid
}

export async function octetSignedDataQuery(uuid: string): Promise<string> {
  const options = {
    method: 'GET',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/data/sign/${uuid}`,
    headers: {
      accept: 'application/json', 
      Authorization: `Bearer ${octetKey}`
    }
  }

  const res = await axios.request(options)

  return res.data.status === "SUCCESS" ? res.data.serializedSignedData : "FAIL"
}

export async function octetSignedTxQuery(uuid: string): Promise<string> {
  const options = {
    method: 'GET',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/transactions/sign/${uuid}`,
    headers: {
      accept: 'application/json', 
      Authorization: `Bearer ${octetKey}`
    }
  }

  const res = await axios.request(options)

  return res.data.status === "SUCCESS" ? res.data.serializedSignedTransaction : "FAIL"
}