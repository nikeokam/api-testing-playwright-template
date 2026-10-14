import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'

test.describe('GET /product/{id}', () => {
  test('get product with correct id should receive code 200', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/1')

    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status, body and headers
    console.log('response body:', responseBody)
    // Check if the response status is 200
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('get product with incorrect id should receive code 404', async ({ request }) => {
    // Build and send a GET request to the server
    const allProductResponse = await request.get('https://shop.tl-academy.ee/api/products')
    const allProductBody = await allProductResponse.json()
    const oneProductRequestUrl: number = allProductBody.length

    const oneProductResponse = await request.get(
      'https://shop.tl-academy.ee/api/products/' + oneProductRequestUrl + 1,
    )

    const oneProductBody = await oneProductResponse.json()
    const statusCode = oneProductResponse.status()

    console.log('response body:', oneProductBody)
    expect(statusCode).toBe(StatusCodes.NOT_FOUND)
  })

  test('get product with incorrect id should receive code 400', async ({ request }) => {
    const response = await request.get('https://shop.tl-academy.ee/api/products/w23414fwfe1223')
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('get product with negative id should receive code 400', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/-1')
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('get product with incorrect id with number first', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/1fgrby')
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('get product with 0 id number should receive code 400', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/0')
    const responseBody = await response.json()
    const statusCode = response.status()

    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

test.describe('POST /product/{id}', () => {
  test('post product with correct data should receive code 201', async ({ request }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: 2.39,
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.CREATED)
    // check that body.name is string type
    expect(typeof responseBody.name).toBe('string')
    // check that body.price is number type
    expect(typeof responseBody.price).toBe('number')
  })

  test('post product with incorrect quantity type should receive code 400', async ({ request }) => {
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: 2.39,
      quantity: 'ten',
    }

    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })

    const statusCode = response.status()

    console.log('response status:', statusCode)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product with incorrect name type should receive code 400', async ({ request }) => {
    const requestBody = {
      name: 435466,
      category: 'Fruit',
      price: 2.39,
      quantity: 10,
    }

    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })

    const statusCode = response.status()

    console.log('response status:', statusCode)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product without name should receive code 400', async ({ request }) => {
    const requestBody = {
      category: 'Fruit',
      price: 2.39,
      quantity: 10,
    }

    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })

    const statusCode = response.status()

    console.log('response status:', statusCode)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})
