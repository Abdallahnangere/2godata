"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
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
};

const font = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Helvetica, Arial, sans-serif';

type SettingsForm = {
  supportEmail: string;
  supportPhonePrimary: string;
  supportPhoneSecondary: string;
  whatsappNumber: string;
  whatsappMessage: string;
  cashbackRate: string;
  referralRate: string;
  cashbackEnabled: boolean;
  referralEnabled: boolean;
  defaultNotificationsEnabled: boolean;
  defaultSoundEffectsEnabled: boolean;
  defaultTheme: string;
  aboutText: string;
  helpText: string;
};

export default function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SettingsForm>({
    supportEmail: "",
    supportPhonePrimary: "",
    supportPhoneSecondary: "",
    whatsappNumber: "",
    whatsappMessage: "",
    cashbackRate: "2",
    referralRate: "2",
    cashbackEnabled: true,
    referralEnabled: true,
    defaultNotificationsEnabled: true,
    defaultSoundEffectsEnabled: true,
    defaultTheme: "light",
    aboutText: "",
    helpText: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        const settings = data.settings || {};
        setForm({
          supportEmail: settings.supportEmail || "",
          supportPhonePrimary: settings.supportPhonePrimary || "",
          supportPhoneSecondary: settings.supportPhoneSecondary || "",
          whatsappNumber: settings.whatsappNumber || "",
          whatsappMessage: settings.whatsappMessage || "",
          cashbackRate: String(settings.cashbackRate ?? 2),
          referralRate: String(settings.referralRate ?? 2),
          cashbackEnabled: settings.cashbackEnabled ?? true,
          referralEnabled: settings.referralEnabled ?? true,
          defaultNotificationsEnabled: settings.defaultNotificationsEnabled ?? true,
          defaultSoundEffectsEnabled: settings.defaultSoundEffectsEnabled ?? true,
          defaultTheme: settings.defaultTheme || "light",
          aboutText: settings.aboutText || "",
          helpText: settings.helpText || "",
        });
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const save = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cashbackRate: Number(form.cashbackRate || 0),
          referralRate: Number(form.referralRate || 0),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Loader2 size={28} style={{ color: T.blue, animation: "spin 1s linear infinite" }} /></div>;
  }

  return (
    <div style={{ display: "grid", gap: 18, fontFamily: font }}>
      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20 }}>Support & Contact</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Field label="Support Email" value={form.supportEmail} onChange={(value) => setForm({ ...form, supportEmail: value })} />
          <Field label="Primary Phone" value={form.supportPhonePrimary} onChange={(value) => setForm({ ...form, supportPhonePrimary: value })} />
          <Field label="Secondary Phone" value={form.supportPhoneSecondary} onChange={(value) => setForm({ ...form, supportPhoneSecondary: value })} />
          <Field label="WhatsApp Number" value={form.whatsappNumber} onChange={(value) => setForm({ ...form, whatsappNumber: value })} />
        </div>
        <div style={{ marginTop: 12 }}>
          <TextArea label="WhatsApp Message" value={form.whatsappMessage} onChange={(value) => setForm({ ...form, whatsappMessage: value })} rows={3} />
        </div>
      </div>

      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20 }}>Rewards & Defaults</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Field label="Cashback Rate (%)" value={form.cashbackRate} onChange={(value) => setForm({ ...form, cashbackRate: value })} />
          <Field label="Referral Rate (%)" value={form.referralRate} onChange={(value) => setForm({ ...form, referralRate: value })} />
          <Field label="Default Theme" value={form.defaultTheme} onChange={(value) => setForm({ ...form, defaultTheme: value })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
          <Toggle label="Cashback Enabled" checked={form.cashbackEnabled} onChange={(checked) => setForm({ ...form, cashbackEnabled: checked })} />
          <Toggle label="Referral Enabled" checked={form.referralEnabled} onChange={(checked) => setForm({ ...form, referralEnabled: checked })} />
          <Toggle label="Default Notifications" checked={form.defaultNotificationsEnabled} onChange={(checked) => setForm({ ...form, defaultNotificationsEnabled: checked })} />
          <Toggle label="Default Sound Effects" checked={form.defaultSoundEffectsEnabled} onChange={(checked) => setForm({ ...form, defaultSoundEffectsEnabled: checked })} />
        </div>
      </div>

      <div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 20, padding: 20 }}>
        <h3 style={{ margin: "0 0 16px", color: T.textPrimary, fontSize: 20 }}>Customer Copy</h3>
        <div style={{ display: "grid", gap: 12 }}>
          <TextArea label="About Text" value={form.aboutText} onChange={(value) => setForm({ ...form, aboutText: value })} rows={4} />
          <TextArea label="Help Text" value={form.helpText} onChange={(value) => setForm({ ...form, helpText: value })} rows={4} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 18px",
            borderRadius: 12,
            background: T.blue,
            color: "#fff",
            border: "none",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: T.textMuted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px solid ${T.border}`,
          background: T.bgElevated,
          color: T.textPrimary,
          fontFamily: font,
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, rows }: { label: string; value: string; onChange: (value: string) => void; rows: number }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: T.textMuted, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          border: `1px solid ${T.border}`,
          background: T.bgElevated,
          color: T.textPrimary,
          fontFamily: font,
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, background: T.bgElevated, border: `1px solid ${T.border}` }}>
      <span style={{ color: T.textPrimary, fontWeight: 600 }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}
