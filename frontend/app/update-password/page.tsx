// app/reset-password/page.tsx
'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const ResetPasswordPage = () => {
  const router = useRouter()

  // Redirect to reset-password.html when accessing /reset-password
  useEffect(() => {
    router.push("/reset-password.html")  // Redirect to reset-password.html in the public folder
  }, [router])

  return <></>
}

export default ResetPasswordPage
