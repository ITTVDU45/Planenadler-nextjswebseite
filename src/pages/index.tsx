import type { NextPage } from 'next'
import Layout from '@/shared/components/Layout.component'

const Index: NextPage = () => (
  <Layout title="Hjem">
    <main className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-[#1F5CAB]">Planenadler</h1>
      <p className="mt-4 text-sm text-[#1F5CAB]/80">
        Die Startseite wurde temporär vereinfacht, weil mehrere Home-Section-Dateien als iCloud-Placeholder
        vorlagen und den Build blockiert haben.
      </p>
    </main>
  </Layout>
)

export default Index
