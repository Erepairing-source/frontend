import { getApiBase } from '@lib/api'

export function loadRazorpayScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser only'))
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

/**
 * Open Razorpay Checkout for autopay mandate (card / UPI).
 * @returns {Promise<object>} verify API response
 */
export async function openAutopayCheckout(token) {
  const headers = { Authorization: `Bearer ${token}` }
  const orderRes = await fetch(`${getApiBase()}/payments/razorpay/setup-order`, {
    method: 'POST',
    headers,
  })
  const orderData = await orderRes.json()
  if (!orderRes.ok) {
    throw new Error(orderData.detail || 'Could not start payment')
  }

  const Razorpay = await loadRazorpayScript()

  return new Promise((resolve, reject) => {
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: orderData.name || 'eRepairing.com',
      description: orderData.description,
      order_id: orderData.order_id,
      customer_id: orderData.customer_id,
      prefill: orderData.prefill || {},
      notes: orderData.notes || {},
      theme: { color: '#0d9488' },
      handler: async (response) => {
        try {
          const verifyRes = await fetch(`${getApiBase()}/payments/razorpay/verify-setup`, {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()
          if (!verifyRes.ok) {
            reject(new Error(verifyData.detail || 'Payment verification failed'))
            return
          }
          resolve(verifyData)
        } catch (err) {
          reject(err)
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    }
    const rzp = new Razorpay(options)
    rzp.open()
  })
}
