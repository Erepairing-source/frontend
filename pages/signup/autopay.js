import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Logo from '../../components/Logo'
import RazorpayAutopayModal from '../../components/RazorpayAutopayModal'
import { getApiBase } from '@lib/api'

export default function SignupAutopay() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }
    fetch(`${getApiBase()}/payments/razorpay/autopay-status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setStatus(data)
        if (data.autopay_setup_complete) {
          router.replace('/organization-admin/dashboard')
        } else if (data.configured) {
          setOpen(true)
        }
      })
      .catch(() => setOpen(true))
  }, [router])

  const handleSuccess = () => {
    router.push('/organization-admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-indigo-50/40 pt-20 px-4">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto h-16 flex items-center">
          <Link href="/">
            <Logo className="h-10" />
          </Link>
        </div>
      </header>
      <div className="max-w-lg mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Complete payment setup</h1>
        <p className="text-slate-600 mb-6">
          Save your card or UPI for autopay. Your plan charge runs after{' '}
          {status?.billing_interval_months || 6} months, then every{' '}
          {status?.billing_interval_months || 6} months.
        </p>
        {!status?.configured && (
          <p className="text-amber-700 text-sm">
            Payment gateway is not configured on the server. Contact support.
          </p>
        )}
      </div>
      <RazorpayAutopayModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={handleSuccess}
        billingIntervalMonths={status?.billing_interval_months || 6}
        nextChargeInr={status?.next_charge_amount_inr}
        planName={status?.plan_name}
        dismissible={false}
      />
    </div>
  )
}
