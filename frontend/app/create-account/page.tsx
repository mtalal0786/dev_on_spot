// app/create-account/page.tsx
'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const CreateAccountPage = () => {
  const router = useRouter()

  // Redirect to create-account.html when accessing /create-account
  useEffect(() => {
    router.push("/create-account.html")  // Redirect to create-account.html in the public folder
  }, [router])

  return <></>
}

export default CreateAccountPage
