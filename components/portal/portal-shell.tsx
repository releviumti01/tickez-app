import type React from "react"
interface PortalShellProps {
  children: React.ReactNode
}

export function PortalShell({ children }: PortalShellProps) {
  return <div className="grid gap-8">{children}</div>
}
