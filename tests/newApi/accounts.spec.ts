import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'
import { AccountDTO } from '../../dto/AccountDTO'

const baseUrl = 'https://shop.tl-academy.ee'
const authHeader = {
  'X-API-Key': 'my-api-key',
}
const authHeader2 = {
  'X-API-Key': 'sdsfsf',
}

//interface CreateAccountResp {
//  id: number,
//  owner: string,
//  currency: string,
// balance: number,
//  createdAt: string,
//}

type CreateAccountResp = {
  id: number
  owner: string
  currency: string
  balance: number
  createdAt: string
}

type AccountsResp = CreateAccountResp[]

type CreateAccountErrorResp = {
  error: string
}


test.describe('/api/accounts negative tests', async () => {
  test('TL-11-1 POST /api/account with valid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: CreateAccountResp = await response.json()
    expect(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect(response.status()).toBe(StatusCodes.CREATED)
    expect(respBody.owner).toBe(account.owner)
  })

  test('TL-11-2 POST /api/account with invalid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner', 'PLN')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: CreateAccountErrorResp = await response.json()
    console.log(respBody)
    expect.soft(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect.soft(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect.soft(respBody.error).not.toBeUndefined()
    expect.soft(respBody.error.length).toBeGreaterThan(0)
  })
})

const currencies = ['USD', 'EUR', 'PLN']

test(`TL-11-3 /api/account with valid data and all supported currencies: ${currencies}`, async ({
  request,
}) => {
  for (const currency of currencies) {
    const account = new AccountDTO('Test Owner', currency)
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect.soft(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect.soft(response.status()).toBe(StatusCodes.CREATED)
    expect.soft(respBody.owner).toBe(account.owner)
    expect.soft(respBody.currency).toBe(account.currency)
  }
})

test.describe('Task 1.1 | GET /api/accounts/{id} critical path', async () => {
  test('TL-11-4 GET /api/account with valid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)

    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('TL-11-5 GET /api/account with missing API key', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts', {
      data: account,
      headers: authHeader2,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })
})
  test.describe('Task 1.2 | GET /api/accounts/{id} critical path', async () => {

  test('TL-11-6 GET /api/account/{id} valid invoice', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts/1', {
      data: account,
      headers: authHeader,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('TL-11-7 GET /api/account/{id} invalid invoice number', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts/999', {
      data: account,
      headers: authHeader,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  test('TL-11-8 GET /api/account/{id} invalid account id', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts/ykh', {
      data: account,
      headers: authHeader,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-9 GET /api/account/{id} invalid account id is with negative number', async ({
    request,
  }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts/-1', {
      data: account,
      headers: authHeader,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })
})

test.describe('Task 1.4 | POST /api/accounts critical path', async () => {
  test('TL-11-10 POST api/accounts/{id}/deposit with valid data', async ({
    request,
  }) => {
    const amount = 25.5
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: {amount},
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('TL-11-11 POST api/accounts/{id}/deposit with 0 amount', async ({ request }) => {
    const amount = 0
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: { amount },
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-12 POST api/accounts/{id}/deposit with text amount', async ({ request }) => {
    const amount = "10"
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: { amount },
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-13 POST api/accounts/{id}/deposit amount with more than two decimals', async ({ request }) => {
    const amount = 1.234
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: { amount },
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-14 POST api/accounts/{id}/deposit with invalid account', async ({
    request,
  }) => {
    const amount = 10
    const response = await request.post(baseUrl + '/api/accounts/999/deposit', {
      headers: authHeader,
      data: { amount },
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })
})

