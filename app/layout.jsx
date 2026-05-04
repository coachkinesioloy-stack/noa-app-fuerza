// app/layout.jsx
export const metadata = {
  title: 'NOA — Never Over, Always',
  description: 'Plataforma de entrenamiento de fuerza inteligente',
  manifest: '/manifest.json',
  themeColor: '#00E5A0',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="NOA" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#070C18', color: '#E8F0FE' }}>
        {children}
      </body>
    </html>
  )
}
