"use client"
import {
  Home,
  BarChart,
  Globe,
  Users,
  Shield,
  Server,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LayoutTemplate,
  FileText,
  Gift,
  Zap,
  Share2,
  Brain,
  Wrench,
  Puzzle,
  Beaker,
  Edit,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface SidebarProps {
  isCollapsed: boolean
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  // const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/ai-models", icon: Brain, label: "AI Models" },
    { href: "/workflows", icon: Share2, label: "Workflows" },
    { href: "/whiteboard", icon: Edit, label: "Whiteboard" },
    { href: "/analytics", icon: BarChart, label: "Analytics" },
    { href: "/domains", icon: Globe, label: "Domains" },
    { href: "/users", icon: Users, label: "Users" },
    { href: "/security", icon: Shield, label: "Security" },
    { href: "/infrastructure", icon: Server, label: "Infrastructure" },
    { href: "/billing", icon: CreditCard, label: "Billing" },
    { href: "/tools", icon: Wrench, label: "Tools" },
    { href: "/templates", icon: LayoutTemplate, label: "Templates" },
    { href: "/blog", icon: FileText, label: "Blog" },
    { href: "/plugins", icon: Puzzle, label: "Plugins" },
    { href: "/earn-rewards", icon: Gift, label: "Earn Rewards" },
    { href: "/plans", icon: Zap, label: "Plans" },
    { href: "/settings", icon: Settings, label: "Settings" },
    { href: "/testing", icon: Beaker, label: "Testing" },
  ]

  return !pathname.startsWith("/new-project/") ? (
    <aside className={`bg-background border-r p-4 transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
      <div className="flex justify-end mb-4">
        <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-2 text-foreground hover:text-primary transition-colors ${
                  isCollapsed ? "justify-center py-2" : ""
                }`}
              >
                <item.icon className={`w-5 h-5 ${isCollapsed ? "mx-auto" : ""}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {!isCollapsed && (
        <div className="mt-8 p-4 bg-primary/10 rounded-lg">
          <h3 className="font-semibold mb-2 text-primary">Upgrade to Pro</h3>
          <p className="text-sm mb-4">Unlock advanced features and boost your productivity</p>
          <Link href="/plans">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Upgrade Now
              <Badge variant="secondary" className="ml-2 bg-primary-foreground text-primary">
                Save 20%
              </Badge>
            </Button>
          </Link>
        </div>
      )}
    </aside>
  ) : null
}
