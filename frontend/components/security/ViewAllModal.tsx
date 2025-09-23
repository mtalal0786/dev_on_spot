"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Dataset = "firewalls" | "certs" | "alerts" | "loginAttempts" | "malware" | "securityPlans";

type Item = Record<string, any>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  dataset: Dataset
  rows: Item[]
  columns: { key: string; label: string; className?: string }[]
  onOpenFullPage: () => void
}

export function ViewAllModal({
  open,
  onOpenChange,
  title,
  dataset,
  rows,
  columns,
  onOpenFullPage,
}: Props) {
  const [q, setQ] = React.useState("")

  const filtered = rows.filter((r) =>
    JSON.stringify(r).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] p-0 overflow-hidden">
        {/* sticky header w/ search */}
        <div className="sticky top-0 z-10 border-b bg-background p-4">
          <DialogHeader>
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </DialogHeader>
          <div className="mt-3 flex items-center gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${dataset}...`}
              className="w-full"
            />
            <Button variant="secondary" onClick={onOpenFullPage}>
              Open full page
            </Button>
          </div>
        </div>

        {/* scrollable table */}
        <div className="overflow-auto p-4">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key} className={c.className}>{c.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row, i) => (
                <TableRow key={i}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {row[c.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                    No results
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
