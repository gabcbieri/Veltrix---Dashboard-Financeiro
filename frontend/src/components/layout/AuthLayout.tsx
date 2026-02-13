import { Outlet } from 'react-router-dom'
import { Sparkles, ShieldCheck, Zap } from 'lucide-react'
import { BRAND_NAME, BRAND_SLOGAN } from '../../constants/brand'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-paper text-earth-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-10">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-earth-600/80 bg-earth-900/70 shadow-glow md:grid-cols-2">
          <section className="p-8 md:p-12">
            <Outlet />
          </section>

          <section className="hidden border-l border-earth-600/70 bg-earth-900/70 p-12 md:block">
            <div className="space-y-7">
              <p className="text-xs uppercase tracking-[0.34em] text-earth-300">Sistema financeiro</p>
              <h1 className="text-5xl font-bold leading-tight text-wine-50">{BRAND_NAME}</h1>
              <p className="max-w-md text-lg text-earth-200">{BRAND_SLOGAN}.</p>

              <div className="space-y-3 pt-6 text-sm text-earth-200">
                <div className="flex items-center gap-3 rounded-xl border border-earth-600/70 bg-earth-800/55 px-4 py-3">
                  <Zap size={16} className="text-copper-300" />
                  Analise instantanea, decisoes rapidas.
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-earth-600/70 bg-earth-800/55 px-4 py-3">
                  <ShieldCheck size={16} className="text-copper-300" />
                  Seus dados protegidos com autenticacao segura.
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-earth-600/70 bg-earth-800/55 px-4 py-3">
                  <Sparkles size={16} className="text-copper-300" />
                  Experiencia moderna para o seu dia a dia financeiro.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
