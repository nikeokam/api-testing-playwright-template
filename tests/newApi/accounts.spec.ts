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

test.describe('/api/accounts negative tests', () => {
  test('TL-11-1 POST /api/account with valid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
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
  test.fail()
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

// Начало ДЗ

test.describe('Task 1.1 | GET /api/accounts/{id} critical path', () => {
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

  test('TL-11-5-1 GET /api/account with incorrect API key', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts', {
      data: account,
      headers: authHeader2,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  test('TL-11-5-2 GET /api/account with missing API key', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts', {
      data: account,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })
})

test.describe('Task 1.2 | GET /api/accounts/{id} critical path', () => {
  test('TL-11-6-1 GET /api/accounts/{id} valid account', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const createResp = await request.post(baseUrl + `/api/accounts`, {
      headers: authHeader,
      data: account,
    })
    const newAccount: CreateAccountResp = await createResp.json()
    const id = newAccount.id

    console.log(newAccount)
    expect(createResp.status()).toBe(StatusCodes.CREATED)

    const response = await request.get(baseUrl + `/api/accounts/${id}`, {
      headers: authHeader,
    })

    const respBody: CreateAccountResp = await response.json()
    expect(response.status()).toBe(StatusCodes.OK)
    expect(respBody.id).toBe(id)
    expect(respBody.owner).toBe(account.owner)
  })

  test('TL-11-7-1 GET /api/accounts/{id} non existing account', async ({ request }) => {
    const id = 999
    const response = await request.get(baseUrl + `/api/accounts/${id}`, {
      headers: authHeader,
    })

    const respBody = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  test('TL-11-7-2 GET /api/accounts/{id} invalid account number', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts/999', {
      data: account,
      headers: authHeader,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  test('TL-11-8 GET /api/accounts/{id} invalid account id', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.get(baseUrl + '/api/accounts/ykh', {
      data: account,
      headers: authHeader,
    })

    const respBody: AccountsResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-9 GET /api/accounts/{id} invalid account id is with negative number', async ({
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

test.describe('Task 1.4 | POST /api/accounts critical path', () => {
  test('TL-11-10 POST api/accounts/{id}/deposit with valid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response1 = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const respBody1: CreateAccountResp = await response1.json()
    console.log(respBody1)

    //добавление 25.5 к балансу и тест баланса относительно созданного баланса счета

    const amount = 25.5
    const response2 = await request.post(baseUrl + `/api/accounts/${respBody1.id}/deposit`, {
      headers: authHeader,
      data: { amount },
    })

    const respBody2: CreateAccountResp = await response2.json()
    expect(response2.status()).toBe(StatusCodes.OK)
    expect(respBody2.balance).toBe(respBody1.balance + amount)

    // проверка, что пришел точно созданный счет

    const response3 = await request.get(baseUrl + `/api/accounts/${respBody1.id}`, {
      headers: authHeader,
    })

    const respBody3: CreateAccountResp = await response3.json()
    expect(response3.status()).toBe(StatusCodes.OK)
    expect(respBody3.id).toBe(respBody2.id)

    //проверяем созданный id счета есть ли в списке

    const response4 = await request.get(baseUrl + '/api/accounts', {
      headers: authHeader,
    })
    expect(response4.status()).toBe(StatusCodes.OK)

    const respBody4: AccountsResp = await response4.json()
    let isInList = false
    for (const acc of respBody4) {
      if (acc.id === respBody1.id) {
        isInList = true
      }
    }
    expect(isInList).toBe(true)
  })

  test('TL-11-11 POST api/accounts/{id}/deposit with 0 amount', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response1 = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const respBody1: CreateAccountResp = await response1.json()
    console.log(respBody1)

    const amount = 0
    const response = await request.post(baseUrl + `/api/accounts/${respBody1.id}/deposit`, {
      headers: authHeader,
      data: { amount },
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-12 POST api/accounts/{id}/deposit with text amount', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response1 = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const respBody1: CreateAccountResp = await response1.json()
    console.log(respBody1)

    const amount = '10'
    const response = await request.post(baseUrl + `/api/accounts/${respBody1.id}/deposit`, {
      headers: authHeader,
      data: { amount },
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-13 POST api/accounts/{id}/deposit amount with more than two decimals', async ({
    request,
  }) => {
    const account = new AccountDTO('Test Owner')
    const response1 = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const respBody1: CreateAccountResp = await response1.json()
    console.log(respBody1)

    const amount = 1.234
    const response = await request.post(baseUrl + `/api/accounts/${respBody1.id}/deposit`, {
      headers: authHeader,
      data: { amount },
    })

    const respBody: CreateAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-14 POST api/accounts/{id}/deposit with invalid account', async ({ request }) => {
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
