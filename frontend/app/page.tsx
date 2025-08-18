'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const HomePage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push("/index.html")  // No need for this, Next.js serves the file automatically
  }, [router])

  return <></>  // Just an empty fragment, as it doesn't need to render anything
}

export default HomePage
