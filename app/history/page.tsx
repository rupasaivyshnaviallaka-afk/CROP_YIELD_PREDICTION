import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import CropDashboard from '@/components/crop-dashboard'
import { auth } from '@/lib/auth'

export default async function HistoryPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in?callbackURL=%2Fhistory')
  return <CropDashboard section="history" />
}
