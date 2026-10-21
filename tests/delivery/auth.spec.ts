import { expect, test } from '@playwright/test'
import { Login } from '../../dto/login-dto'
import { createOrder, fetchJwt } from '../../helpers/api-helper'
import { StatusCodes } from 'http-status-codes'
import { loginRequestBodySchema, TokenSchema } from '../../schema/LoginSchema'
import { GetOrdersResponseSchema } from '../../schema/OrderSchema'

let loginDto: Login
export const baseUrl = 'https://backend.tallinn-learning.ee'
export const loginEndpoint = '/login/student'
export const ordersEndpoint = '/orders'
export const statusEndpoint = '/status'

test.describe('Authorization flow', () => {
  test.beforeAll(() => {
    loginDto = new Login(process.env['DL_USERNAME']!, process.env['DL_PASSWORD']!)
  })

  test('TL-12-1 should login and receive authorization token', async ({ request }) => {
    const user: Login = {
      username: process.env['DL_USERNAME']!,
      password: process.env.DL_PASSWORD!,
    }
    const validatedUser: Login = loginRequestBodySchema.parse(user)
    const response = await request.post(baseUrl + loginEndpoint, {
      data: validatedUser,
    })
    const token = await response.text()
    const validatedToken = TokenSchema.parse(token)
    expect(validatedToken).toBeDefined()
  })

  test('should create order', async ({ request }) => {
    const token = await fetchJwt(request, loginDto)
    const orderId = await createOrder(request, token)
    expect(orderId).toBeDefined()
  })

  test('should not create order', async ({ request }) => {
    const response = await request.post(baseUrl + ordersEndpoint, {
      data: {
        status: 'OPEN',
        courierId: 0,
        customerName: 'vladimir',
        customerPhone: '55445566',
        comment: 'hello',
        id: 0,
      },
      headers: {
        Authorization: `Bearer`,
      },
    })
    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  type Order = {
    status: string
    courierId: number | null
    customerName: string
    customerPhone: string
    comment: string | null
    id: number
  }
  test('should get orders with authorization token', async ({ request }) => {
    const token = await fetchJwt(request, loginDto)

    const response = await request.get(baseUrl + ordersEndpoint, {
      headers: {
        accept: '*/*',
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.status()).toBe(200)
    const orders: Order[] = GetOrdersResponseSchema.parse(await response.json())
    console.log('Orders:', JSON.stringify(orders, null, 2))
    expect(orders).toBeTruthy()
  })

  //начало ДЗ

  test('should check status PUT /orders/{id}/status, but returns 403 for student', async ({
    request,
  }) => {
    const token = await fetchJwt(request, loginDto)
    const orderId = await createOrder(request, token)
    expect(orderId).toBeDefined()
    console.log(orderId)

    const response = await request.put(baseUrl + ordersEndpoint + '/' + orderId + statusEndpoint, {
      headers: { Authorization: `Bearer ${token}` },
      data: { status: 'OPEN' },
    })

    expect(response.status()).toBe(StatusCodes.FORBIDDEN)
  })

  test.fail('should create and delete order', async ({ request }) => {
    //creates order
    const token = await fetchJwt(request, loginDto)
    const orderId = await createOrder(request, token)
    expect(orderId).toBeDefined()

    //deletes created order
    const deleteResponse = await request.delete(baseUrl + ordersEndpoint + '/' + orderId, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(deleteResponse.status()).toBe(StatusCodes.OK)

    //checks that created order is deleted
    const response = await request.get(baseUrl + ordersEndpoint + '/' + orderId, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })
})
