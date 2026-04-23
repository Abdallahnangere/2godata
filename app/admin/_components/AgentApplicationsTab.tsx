"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

const T = {
  bgCard: "rgba(255,255,255,0.86)",
  bgElevated: "#F6F1EE",
  blue: "#1E2D4C",
  textPrimary: "#1E2D4C",
  textSecondary: "#566176",
  textMuted: "#858585",
  border: "rgba(30,45,76,0.10)",
  green: "#5F7A5B",
  red: "#A65C5C",
};

const font = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif';

type Application = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
};

export default function AgentApplicationsTab() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/agent-applications", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch applications");
      const data = await res.json();
      setApplications(Array.isArray(data.applications) ? data.applications : []);
    } catch {
      toast.error("Failed to load agent applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const review = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      setBusyId(id);
      const res = await fetch(`/api/admin/agent-applications/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Application ${status === "APPROVED" ? "approved" : "rejected"}`);
      await fetchItems();
    } catch {
      toast.error("Failed to update application");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 size={28} style={{ color: T.blue, animation: "spin 1s linear infinite" }} /></div>;
  }

  return (
    <div style={{ display: "grid", gap: 14, fontFamily: font }}>
      {applications.length === 0 && (
        <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: 24, color: T.textSecondary }}>
          No agent applications yet.
        </div>
      )}
      {applications.map((item) => (
        <div key={item.id} style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
            <div>
              <h3 style={{ margin: 0, color: T.textPrimary, fontSize: 18 }}>{item.name || "Unnamed user"}</h3>
              <p style={{ margin: "6px 0 0", color: T.textSecondary, fontSize: 14 }}>{item.email || item.phone}</p>
              <p style={{ margin: "6px 0 0", color: T.textMuted, fontSize: 12 }}>{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <span style={{ padding: "6px 10px", borderRadius: 999, background: T.bgElevated, color: T.blue, fontWeight: 700, fontSize: 12 }}>
              {item.status}
            </span>
          </div>
          {item.message && <p style={{ margin: "14px 0 0", color: T.textPrimary, lineHeight: 1.7 }}>{item.message}</p>}
          {item.status === "PENDING" && (
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <button onClick={() => review(item.id, "APPROVED")} disabled={busyId === item.id} style={actionButton(T.green)}>
                {busyId === item.id ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={15} />}
                Approve
              </button>
              <button onClick={() => review(item.id, "REJECTED")} disabled={busyId === item.id} style={actionButton(T.red)}>
                {busyId === item.id ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <XCircle size={15} />}
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function actionButton(color: string) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    background: color,
    color: "#fff",
    fontWeight: 700,
  } as const;
}
