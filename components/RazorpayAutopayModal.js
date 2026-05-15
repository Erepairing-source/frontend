import { useState } from 'react'
import { CreditCard, Loader2, X } from 'lucide-react'
import { Button } from './ui/button'
import { openAutopayCheckout } from '../lib/razorpayCheckout'

export default function RazorpayAutopayModal({
  open,
  onClose,
  onSuccess,
  billingIntervalMonths = 6,
  nextChargeInr,
  planName,
  dismissible = false,
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handlePay = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await openAutopayCheckout(token)
      onSuccess?.(result)
      onClose?.()
    } catch (err) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        {dismissible && (
          <button type="button" className="absolute top-4 right-4 text-slate-400 hover:text-slate-700" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        )}
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="text-teal-600" size={28} />
          <h2 className="text-xl font-bold text-slate-900">Set up autopay</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Add a <strong>credit/debit card</strong> or <strong>UPI</strong> for your {planName ? <strong>{planName}</strong> : 'subscription'} plan.
          We authorize Rs 1 now to save your payment method via Razorpay.
        </p>
        <ul className="text-sm text-slate-600 list-disc list-inside mb-4 space-y-1">
          <li>First plan charge after <strong>{billingIntervalMonths} months</strong></li>
          {nextChargeInr != null && <li>Amount then: <strong>Rs {nextChargeInr}</strong> (incl. 18% GST)</li>}
          <li>Recurring charge every {billingIntervalMonths} months on the same date</li>
        </ul>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex flex-col gap-2">
          <Button type="button" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading} onClick={handlePay}>
            {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening Razorpay</>) : 'Continue with Razorpay'}
          </Button>
          {dismissible && <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Remind me later</Button>}
        </div>
      </div>
    </div>
  )
}
