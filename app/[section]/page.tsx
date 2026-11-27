import { notFound } from 'next/navigation'
import CropDashboard from '@/components/crop-dashboard'

const sections = ['predict', 'dataset', 'model-comparison', 'analytics', 'feature-importance', 'methodology', 'about', 'settings']

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (!sections.includes(section)) notFound()
  return <CropDashboard section={section} />
}
