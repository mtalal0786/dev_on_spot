"use client"

import { useState } from "react"
import { TopNav } from "../../components/top-nav"
import { Sidebar } from "../../components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Globe, Link, Shield, Check, X, Loader2 } from "lucide-react"
import { ThemeProvider } from "../../components/theme-provider"




const sampleDomains = [
  { name: "example.com", registrationDate: "2023-01-15", expirationDate: "2024-01-15", status: "Active" },
  { name: "myapp.io", registrationDate: "2023-03-22", expirationDate: "2024-03-22", status: "Active" },
  { name: "coolproject.dev", registrationDate: "2023-05-10", expirationDate: "2024-05-10", status: "Active" },
]

export default function DomainsPage() {
  const [domainToCheck, setDomainToCheck] = useState("")
  const [domainAvailability, setDomainAvailability] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkDomainAvailability = async () => {
    // Clear previous results and errors
    setDomainAvailability(null)
    setError(null)
    setIsLoading(true)

    // A real application would not hardcode localhost, but for this specific request,
    // we'll assume the backend is running at this address.
    const apiUrl = `http://localhost:5000/api/domains/check-availability?name=${encodeURIComponent(domainToCheck)}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch availability.");
      }

      setDomainAvailability(data.isAvailable ? "available" : "unavailable");

    } catch (err: any) {
      // Catch network errors or API-specific errors
      setError(err.message || "An unexpected error occurred. Please try again.");
      console.error("API call failed:", err);
      setDomainAvailability("unavailable"); // Default to unavailable on error
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background">
        <TopNav />
        <div className="flex">
          <Sidebar isCollapsed={false} />
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
                    placeholder="Enter domain name (e.g., google)"
                    value={domainToCheck}
                    onChange={(e) => setDomainToCheck(e.target.value)}
                  />
                  <Button onClick={checkDomainAvailability} disabled={isLoading || domainToCheck === ""}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Check"
                    )}
                  </Button>
                </div>
                {isLoading && (
                    <p className="mt-2 flex items-center text-gray-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking availability...
                    </p>
                )}
                {!isLoading && domainAvailability && (
                  <p className={`mt-2 flex items-center ${domainAvailability === "available" ? "text-green-500" : "text-red-500"}`}>
                    {domainAvailability === "available" ? (
                      <Check className="inline mr-2" />
                    ) : (
                      <X className="inline mr-2" />
                    )}
                    Domain is {domainAvailability}
                  </p>
                )}
                {error && (
                    <p className="mt-2 text-red-500">{error}</p>
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
