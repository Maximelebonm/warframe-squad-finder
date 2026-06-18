import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import { Navbar } from '../components/navbar'
import { Footer } from '#/components/footer'


import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    ssr: false,
     meta: [
    { charSet: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { title: 'Warframe Squad Finder' },
    {icon : "href=images/logowsf.png"},
    { name: 'description', content: 'Trouve des joueurs Warframe pour ouvrir tes reliques et farmer ensemble.' },
    { name: 'theme-color', content: '#000000' },
    { property: 'og:site_name', content: 'Warframe Squad Finder' },
    { property: 'og:type', content: 'website' },
  ],
  links: [
    { rel: 'stylesheet', href: appCss },
    { rel: 'canonical', href: 'https://warframe-squad-finder.com' },
    { rel: 'icon', type: 'image/png', href: '/images/iconwsf.png' },
  ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
              <main className="flex-1 flex flex-col">
          {children}
        </main>
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        /> */}
        <Footer/>
        <Scripts />
      </body>
    </html>
  )
}
