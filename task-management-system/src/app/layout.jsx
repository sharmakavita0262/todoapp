import "./globals.css"
import { Inter } from "next/font/google"
import FooterScripts from "@/components/common/FooterScripts"
import HeaderScript from "../components/common/HeaderScript"
import MainLayout from "../components/layout/MainLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mediasoft Support",
  description: "Modern Task Management System",
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className="light-style layout-navbar-fixed layout-menu-fixed layout-footer-fixed"
      dir="ltr"
      data-theme="theme-default"
      data-assets-path="assets/"
      data-template="vertical-menu-template"
    >
      <HeaderScript />
      <body className={inter.className}>
        <div className="bg-decorative"></div>
        <div className="layout-wrapper layout-content-navbar relative">
          <MainLayout>
            <div className="relative" style={{ zIndex: 10 }}>
              {children}
            </div>
          </MainLayout>
        </div>
        {/* <FooterScripts /> */}
      </body>
    </html>
  )
}
