const axios = require('axios')

async function generateAccessToken() {
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    })
    console.log(response.data)
    return response.data.access_token
}

exports.createOrder = async () => {
    const accessToken = await generateAccessToken()

    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            
            'Authorization': 'Bearer ' + accessToken
        },
        data: JSON.stringify({ 
            intent: "CAPTURE", 
            purchase_units: [ 
                { 
                    reference_id: "d9f80740-38f0-11e8-b467-0ed5f89f718b",
                    
                    amount: { 
                        currency_code: "USD",
                        value: "100.00",
                        breakdown: {
                            item_total:{
                                currency_code: "USD",
                                value: "100.00",
                            }
                        }
                     
                    }
                     
                }
             
            ],
             
            
            application_context: { 
                return_url: process.env.BASE_URL + "/complete-order", 
                cancel_url: process.env.BASE_URL + "/cancel-order",
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'donateforachange.io'
            } 
            
        }) 
        
    })
    return response.data.links.find(link => link.rel === 'approve').href
}

exports.capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken()
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            
            'Authorization': 'Bearer ' + accessToken
        }
    })
    console.log(response.data)
    return response.data
}