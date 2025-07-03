"use client"

import { useState } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Globe, Link, Shield, Check, X } from "lucide-react"
import { ThemeProvider } from "../../components/theme-provider"

const sampleDomains = [
  { name: "example.com", registrationDate: "2023-01-15", expirationDate: "2024-01-15", status: "Active" },
  { name: "myapp.io", registrationDate: "2023-03-22", expirationDate: "2024-03-22", status: "Active" },
  { name: "coolproject.dev", registrationDate: "2023-05-10", expirationDate: "2024-05-10", status: "Active" },
]

export default function DomainsPage() {
  const [domainToCheck, setDomainToCheck] = useState("")
  const [domainAvailability, setDomainAvailability] = useState<string | null>(null)

  const checkDomainAvailability = () => {
    // This is a mock check. In a real application, you would call an API to check domain availability.
    const isAvailable = Math.random() < 0.5
    setDomainAvailability(isAvailable ? "available" : "unavailable")
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-foreground mb-8">Domains</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2" />
                    Active Domains
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{sampleDomains.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Link className="mr-2" />
                    Custom Domains
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{sampleDomains.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" />
                    SSL Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">{sampleDomains.length} Active</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Check Domain Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter a domain name"
                    value={domainToCheck}
                    onChange={(e) => setDomainToCheck(e.target.value)}
                  />
                  <Button onClick={checkDomainAvailability}>Check</Button>
                </div>
                {domainAvailability && (
                  <p className={`mt-2 ${domainAvailability === "available" ? "text-green-500" : "text-red-500"}`}>
                    {domainAvailability === "available" ? (
                      <Check className="inline mr-2" />
                    ) : (
                      <X className="inline mr-2" />
                    )}
                    Domain is {domainAvailability}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Registered Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Domain Name</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Expiration Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleDomains.map((domain) => (
                      <TableRow key={domain.name}>
                        <TableCell>{domain.name}</TableCell>
                        <TableCell>{domain.registrationDate}</TableCell>
                        <TableCell>{domain.expirationDate}</TableCell>
                        <TableCell>{domain.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}
