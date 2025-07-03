// "use client"

// import type React from "react"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { useAuth } from "@/lib/auth"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// export default function LoginPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState("")
//   const { login } = useAuth()
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       await login(email, password)
//       router.push("/")
//     } catch (err) {
//       setError("Invalid credentials")
//     }
//   }

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-background">
//       <Card className="w-[350px]">
//         <CardHeader>
//           <CardTitle>Login</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <Button type="submit" className="w-full">
//               Login
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


// app/login/page.tsx
'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const LoginPage = () => {
  const router = useRouter()

  // Redirect to login.html when accessing /login
  useEffect(() => {
    router.push("/login.html")  // Redirect to the login.html file in the public folder
  }, [router])

  return <></>  // Just an empty fragment, as it doesn't need to render anything
}

export default LoginPage
