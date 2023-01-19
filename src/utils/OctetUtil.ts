import axios from 'axios'

const octetId = process.env.NEXT_PUBLIC_OCTET_WALLET_ID
const octetKey = process.env.NEXT_PUBLIC_OCTET_API_KEY

export async function getOctetAddress(): Promise<string> {
  let address = ""

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
    address = response.data[0].address
  })
  .catch(function (error) {
    console.error(error)
  })

  return address
}