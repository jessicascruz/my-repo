import LayoutDefault from '@/presentation/layouts/default'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { GoogleTagManager } from '@next/third-parties/google'
import Script from 'next/script'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Multipay',
  robots: 'noindex, nofollow',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      {process.env.GTM_ID && <GoogleTagManager gtmId={process.env.GTM_ID} />}
      <Script id="hotjar-tracking" strategy="afterInteractive">
        {`
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:6530292,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
      </Script>
      <body className={inter.className}>
        <LayoutDefault>{children}</LayoutDefault>
      </body>
    </html>
  )
}
