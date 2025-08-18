// app/reset-password/page.tsx
'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const ForgetPasswordPage = () => {
  const router = useRouter()

  // Redirect to forget-password.html when accessing /forget-password
  useEffect(() => {
    router.push("/forget-password.html")  // Redirect to forget-password.html in the public folder
  }, [router])

  return <></>
}

export default ForgetPasswordPage
