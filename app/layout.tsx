import "./globals.css"
import { Metadata } from "next"
import { Kanit } from "next/font/google";
import { ReactNode } from "react";

const kanit = Kanit({ 
  subsets: ['thai'],
  weight: "500"
})

export const metadata: Metadata = {
  title: "My app",
  description: "this is smart promo app",
  keywords: ["promo", "smart promo", "best promo"],
}

const layout = ({ children }: { children: ReactNode}) => {
  return (
    <html lang="en" className={kanit.className}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body className="">
      
        {children}
      </body>
    </html>
  )
}
export default layout