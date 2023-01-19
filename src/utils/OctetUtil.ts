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
  };

  const res = await axios.request(options)

  return res.data[0].address
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

export async function octetSignTypedDataQuery(uuid: string): Promise<string> {
  console.log("query")
  const options = {
    method: 'GET',
    url: `https://octet-api.blockchainapi.io/2.0/wallets/${octetId}/data/sign/${uuid}`,
    headers: {accept: 'application/json', Authorization: `Bearer ${octetKey}`}
  }

  const res = await axios.request(options)

  return res.data.status === "SUCCESS" ? res.data.serializedSignedData : "FAIL"
}