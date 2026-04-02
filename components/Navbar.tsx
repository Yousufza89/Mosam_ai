"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const isUser = session?.user?.role === "USER";
  const isAdmin = session?.user?.role === "ADMIN";

  const navLinkStyle = (href: string): React.CSSProperties => ({
    fontSize: "0.78rem",
    fontWeight: pathname === href ? 700 : 500,
    letterSpacing: "0.04em",
    color: pathname === href ? "#ffffff" : "rgba(255,255,255,0.65)",
    textDecoration: "none",
    padding: "6px 0",
    position: "relative",
    transition: "color 0.2s",
    borderBottom: pathname === href ? "1.5px solid rgba(255,255,255,0.7)" : "1.5px solid transparent",
  });

  return (
    <>
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(90,159,212,0.30)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.20)",
        boxShadow: "0 4px 30px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.18) inset",
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>

            {/* ── Logo ── */}
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "rgba(255,255,255,0.22)",
                border: "1px solid rgba(255,255,255,0.38)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem",
                boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
              }}>
                ◈
              </div>
              <span style={{
                fontFamily: "'Georgia', serif",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.01em",
              }}>
                Mosam.ai
              </span>
            </Link>

            {/* ── Desktop nav ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="desktop-nav">

              {isLoading && (
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.50)", letterSpacing: "0.1em" }}>
                  ···
                </span>
              )}

              {/* Guest links */}
              {!isLoggedIn && !isLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <Link href="/login" style={navLinkStyle("/login")}>Login</Link>
                  <Link href="/signup" style={{
                    display: "inline-flex", alignItems: "center",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.92)",
                    color: "#1a4a7a",
                    padding: "8px 20px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    letterSpacing: "0.03em",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* User links */}
              {isUser && (
                <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
                  <NavLink href="/user/dashboard" active={pathname === "/user/dashboard"}>Dashboard</NavLink>
                  <NavLink href="/user/history" active={pathname === "/user/history"}>My History</NavLink>
                  <NavLink href="/user/profile" active={pathname === "/user/profile"}>Profile</NavLink>
                  <LogoutButton onClick={() => signOut({ callbackUrl: "/" })} />
                </div>
              )}

              {/* Admin links */}
              {isAdmin && (
                <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
                  <NavLink href="/admin/dashboard" active={pathname === "/admin/dashboard"}>Dashboard</NavLink>
                  <NavLink href="/admin/performance" active={pathname === "/admin/performance"}>Performance</NavLink>
                  <NavLink href="/admin/all-predictions" active={pathname === "/admin/all-predictions"}>All Predictions</NavLink>
                  <AdminBadge />
                  <LogoutButton onClick={() => signOut({ callbackUrl: "/" })} />
                </div>
              )}

              {/* User avatar (when logged in) */}
              {isLoggedIn && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "linear-gradient(135deg, #a8d8ff, #5a9fd4)",
                    border: "2px solid rgba(255,255,255,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.85rem", fontWeight: 700, color: "white",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                  }}>
                    {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
                  </div>
                  <div style={{ lineHeight: 1.2 }}>
                    <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "white", margin: 0 }}>
                      {session?.user?.name ?? "User"}
                    </p>
                    <p style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.50)", margin: 0, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                      {session?.user?.role}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                display: "none",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "10px",
                padding: "8px 10px",
                cursor: "pointer",
                color: "white",
                fontSize: "1.1rem",
              }}
              className="mobile-menu-btn"
              aria-label="Toggle menu"
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        {mobileOpen && (
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(60,120,190,0.45)",
            backdropFilter: "blur(20px)",
            padding: "1rem 1.5rem 1.5rem",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {!isLoggedIn && !isLoading && (
                <>
                  <MobileNavLink href="/login" label="Login" onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/signup" label="Sign Up" onClick={() => setMobileOpen(false)} highlight />
                </>
              )}
              {isUser && (
                <>
                  <MobileNavLink href="/user/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} active={pathname === "/user/dashboard"} />
                  <MobileNavLink href="/user/history" label="My History" onClick={() => setMobileOpen(false)} active={pathname === "/user/history"} />
                  <MobileNavLink href="/user/profile" label="Profile" onClick={() => setMobileOpen(false)} active={pathname === "/user/profile"} />
                  <button onClick={() => signOut({ callbackUrl: "/" })} style={mobileLogoutStyle}>Logout</button>
                </>
              )}
              {isAdmin && (
                <>
                  <MobileNavLink href="/admin/dashboard" label="Dashboard" onClick={() => setMobileOpen(false)} active={pathname === "/admin/dashboard"} />
                  <MobileNavLink href="/admin/performance" label="Performance" onClick={() => setMobileOpen(false)} active={pathname === "/admin/performance"} />
                  <MobileNavLink href="/admin/all-predictions" label="All Predictions" onClick={() => setMobileOpen(false)} active={pathname === "/admin/all-predictions"} />
                  <button onClick={() => signOut({ callbackUrl: "/" })} style={mobileLogoutStyle}>Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      fontSize: "0.78rem",
      fontWeight: active ? 700 : 500,
      letterSpacing: "0.04em",
      color: active ? "#ffffff" : "rgba(255,255,255,0.65)",
      textDecoration: "none",
      paddingBottom: "3px",
      borderBottom: active ? "1.5px solid rgba(255,255,255,0.75)" : "1.5px solid transparent",
      transition: "color 0.2s, border-color 0.2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "white"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = active ? "white" : "rgba(255,255,255,0.65)"; }}
    >
      {children}
    </Link>
  );
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      borderRadius: "999px",
      border: "1px solid rgba(255,100,100,0.45)",
      background: "rgba(220,50,50,0.18)",
      color: "rgba(255,200,200,0.95)",
      padding: "7px 16px",
      fontSize: "0.75rem",
      fontWeight: 600,
      cursor: "pointer",
      letterSpacing: "0.03em",
      backdropFilter: "blur(8px)",
      transition: "background 0.2s, border-color 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(220,50,50,0.32)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(220,50,50,0.18)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
    >
      ⏏ Logout
    </button>
  );
}

function AdminBadge() {
  return (
    <span style={{
      fontSize: "0.58rem",
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.2em",
      color: "rgba(255,220,100,0.9)",
      border: "1px solid rgba(255,220,100,0.35)",
      background: "rgba(255,200,50,0.12)",
      borderRadius: "999px",
      padding: "3px 10px",
    }}>
      Admin
    </span>
  );
}

function MobileNavLink({ href, label, onClick, active, highlight }: {
  href: string; label: string; onClick: () => void; active?: boolean; highlight?: boolean;
}) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: "block",
      padding: "10px 14px",
      borderRadius: "12px",
      fontSize: "0.85rem",
      fontWeight: active ? 700 : 500,
      textDecoration: "none",
      color: highlight ? "#1a4a7a" : "white",
      background: highlight
        ? "rgba(255,255,255,0.92)"
        : active
          ? "rgba(255,255,255,0.18)"
          : "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.18)",
      transition: "background 0.2s",
    }}>
      {label}
    </Link>
  );
}

const mobileLogoutStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 14px",
  borderRadius: "12px",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "rgba(255,180,180,0.95)",
  background: "rgba(220,50,50,0.18)",
  border: "1px solid rgba(255,100,100,0.30)",
  cursor: "pointer",
  textAlign: "left",
};