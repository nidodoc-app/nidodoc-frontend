import React, { useState, useEffect, useRef } from "react";

// -- palette ------------------------------------------------------------------
const C = {
  green: "#0F6E56", greenMid: "#1D9E75", greenLight: "#E1F5EE", greenDark: "#085041",
  amber: "#BA7517", amberLight: "#FAEEDA", amberDark: "#633806",
  red: "#A32D2D", redLight: "#FCEBEB",
  blue: "#185FA5", blueLight: "#E6F1FB",
  gray: "#444441", grayLight: "#F1EFE8", grayMid: "#B4B2A9",
  white: "#FFFFFF", offWhite: "#F8F7F4",
  text: "#1a1a18", textMuted: "#6b6b67",
};

// -- mock data -----------------------------------------------------------------
const STAFF = [
  {
    id: 1, initials: "CG", name: "Carla Gatti", role: "Coordinatrice educativa",
    contract: "Indeterminato", contractExpiry: null,
    titolo: { label: "Laurea magistrale LM-50", status: "ok" },
    docs: [
      { name: "Contratto", status: "ok", expiry: null },
      { name: "Antincendio", status: "ok", expiry: "2027-12-15" },
      { name: "HACCP", status: "ok", expiry: "2026-11-10" },
      { name: "Sicurezza D.Lgs 81", status: "ok", expiry: "2027-06-01" },
      { name: "Primo soccorso", status: "ok", expiry: "2027-03-20" },
    ],
  },
  {
    id: 2, initials: "MB", name: "Marco Bianchi", role: "Educatore",
    contract: "Indeterminato", contractExpiry: null,
    titolo: { label: "Laurea triennale L-19", status: "ok" },
    docs: [
      { name: "Contratto", status: "ok", expiry: null },
      { name: "Antincendio", status: "danger", expiry: "2026-03-10" },
      { name: "HACCP", status: "ok", expiry: "2026-09-22" },
      { name: "Sicurezza D.Lgs 81", status: "ok", expiry: "2027-06-01" },
      { name: "Primo soccorso", status: "ok", expiry: "2027-03-20" },
    ],
  },
  {
    id: 3, initials: "AR", name: "Anna Rossi", role: "Educatrice",
    contract: "Determinato", contractExpiry: "2026-08-31",
    titolo: { label: "Diploma IeFP - da verificare", status: "warn" },
    docs: [
      { name: "Contratto", status: "ok", expiry: "2026-08-31" },
      { name: "Antincendio", status: "ok", expiry: "2027-01-18" },
      { name: "HACCP", status: "warn", expiry: "2026-05-25" },
      { name: "Sicurezza D.Lgs 81", status: "ok", expiry: "2027-06-01" },
      { name: "Primo soccorso", status: "ok", expiry: "2026-09-14" },
    ],
  },
  {
    id: 4, initials: "LC", name: "Laura Conti", role: "Educatrice supplente",
    contract: "Determinato", contractExpiry: "2026-05-31",
    titolo: { label: "Laurea triennale Scienze Formazione", status: "ok" },
    docs: [
      { name: "Contratto", status: "warn", expiry: "2026-05-31" },
      { name: "Antincendio", status: "ok", expiry: "2027-04-02" },
      { name: "HACCP", status: "warn", expiry: "2026-06-02" },
      { name: "Sicurezza D.Lgs 81", status: "ok", expiry: "2027-06-01" },
      { name: "Primo soccorso", status: "ok", expiry: "2027-08-05" },
    ],
  },
  {
    id: 5, initials: "SF", name: "Sara Ferretti", role: "Cuoca",
    contract: "Indeterminato", contractExpiry: null,
    titolo: { label: "Non richiesto (personale cucina)", status: "ok" },
    docs: [
      { name: "Contratto", status: "ok", expiry: null },
      { name: "Antincendio", status: "ok", expiry: "2027-02-11" },
      { name: "HACCP", status: "warn", expiry: "2026-05-19" },
      { name: "Sicurezza D.Lgs 81", status: "ok", expiry: "2027-06-01" },
    ],
  },
];

const PRESENZE = {
  "Lun 21/04": { bambini: { lattanti: 4, semidivezzi: 5, divezzi: 5 }, educs: 4 },
  "Mar 22/04": { bambini: { lattanti: 4, semidivezzi: 5, divezzi: 5 }, educs: 4 },
  "Mer 23/04": { bambini: { lattanti: 3, semidivezzi: 6, divezzi: 5 }, educs: 2 },
  "Gio 24/04": { bambini: { lattanti: 4, semidivezzi: 4, divezzi: 5 }, educs: 3 },
  "Ven 25/04": { bambini: { lattanti: 2, semidivezzi: 5, divezzi: 4 }, educs: 4 },
};

// -- helpers -------------------------------------------------------------------
const statusColor = (s) => s === "ok" ? C.green : s === "warn" ? C.amber : C.red;
const statusBg = (s) => s === "ok" ? C.greenLight : s === "warn" ? C.amberLight : C.redLight;
const statusLabel = (s) => s === "ok" ? "OK" : s === "warn" ? "!" : "X";

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date("2026-04-27");
  return Math.round((d - now) / 86400000);
};

const fmtDate = (s) => {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return (d) + "/" + (m) + "/" + (y);
};

const overallStatus = (person) => {
  const statuses = person.docs.map(d => d.status);
  if (statuses.includes("danger")) return "danger";
  if (statuses.includes("warn") || person.titolo.status === "warn") return "warn";
  return "ok";
};

// -- shared UI atoms -----------------------------------------------------------
const Pill = ({ label, status, small }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 3,
    fontSize: small ? 10 : 11, fontWeight: 500,
    padding: small ? "2px 6px" : "3px 8px",
    borderRadius: 20,
    background: statusBg(status),
    color: statusColor(status),
    whiteSpace: "nowrap",
  }}>
    {statusLabel(status)} {label}
  </span>
);

const Avatar = ({ initials, status, size = 38 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: statusBg(status), color: statusColor(status),
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.34, fontWeight: 600, flexShrink: 0,
    fontFamily: "'DM Serif Display', serif",
  }}>{initials}</div>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: C.white,
    border: "0.5px solid #e0dfd8",
    borderRadius: 12, padding: "12px 14px",
    marginBottom: 8, cursor: onClick ? "pointer" : "default",
    transition: "border-color 0.15s",
    ...style,
  }}
    onMouseEnter={e => onClick && (e.currentTarget.style.borderColor = C.grayMid)}
    onMouseLeave={e => onClick && (e.currentTarget.style.borderColor = "#e0dfd8")}
  >{children}</div>
);

const AlertCard = ({ type, title, text, action, onAction }) => {
  const s = type === "danger" ? "danger" : type === "warn" ? "warn" : "ok";
  return (
    <div style={{
      background: statusBg(s), border: "0.5px solid " + (statusColor(s)) + "40",
      borderLeft: "3px solid " + (statusColor(s)),
      borderRadius: 8, padding: "10px 12px", marginBottom: 8,
    }}>
      <div style={{ fontWeight: 600, fontSize: 13, color: statusColor(s), marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>{text}</div>
      {action && (
        <button onClick={onAction} style={{
          marginTop: 7, fontSize: 11, fontWeight: 500,
          background: "transparent", border: "1px solid " + (statusColor(s)),
          color: statusColor(s), borderRadius: 6, padding: "3px 10px", cursor: "pointer",
        }}>{action} &gt;</button>
      )}
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase",
    color: C.textMuted, marginBottom: 10, paddingBottom: 6,
    borderBottom: "0.5px solid #e8e7e0",
  }}>{children}</div>
);

// -- SCREENS -------------------------------------------------------------------

// Dashboard
function DashboardScreen({ onNav }) {
  const alerts = [
    { type: "danger", title: "Antincendio scaduto - M. Bianchi", text: "Scaduto il 10/03/2026. Rischio prescrizione in caso di ispezione ATS.", action: "Vai al profilo", nav: "personale" },
    { type: "warn", title: "HACCP in scadenza - 3 persone", text: "Rossi (28gg), Ferretti (22gg), Conti (36gg). Rinnovare entro maggio.", action: "Formazione", nav: "formazione" },
    { type: "warn", title: "Contratto a termine - L. Conti", text: "Scade il 31/05/2026. Valutare rinnovo o sostituzione prima della scadenza.", action: "Vai al profilo", nav: "personale" },
    { type: "warn", title: "Titolo di studio da verificare - A. Rossi", text: "Il diploma IeFP richiede verifica equiparazione DGR Lombardia.", action: "Chiedi all'AI", nav: "ai" },
  ];

  const today = PRESENZE["Mar 22/04"];
  const totalBimbi = Object.values(today.bambini).reduce((a, b) => a + b, 0);
  const rapportoGenerico = (totalBimbi / today.educs).toFixed(1);

  return (
    <div>
      {/* hero stats */}
      <div style={{
        background: "linear-gradient(135deg, " + (C.green) + " 0%, " + (C.greenMid) + " 100%)",
        margin: "-2px -2px 14px", padding: "18px 14px 14px",
        borderRadius: "0 0 16px 16px",
      }}>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 10, fontWeight: 500 }}>
          OGGI . Martedi 22 aprile 2026
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Bambini", val: totalBimbi, sub: "presenti" },
            { label: "Educatrici", val: today.educs, sub: "in servizio" },
            { label: "Rapporto", val: "1:" + (rapportoGenerico), sub: "medio generale" },
          ].map(s => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.15)", borderRadius: 10,
              padding: "10px 8px", textAlign: "center",
            }}>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 9, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{s.label}</div>
              <div style={{ color: "white", fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>{s.val}</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 9, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 2px" }}>
        <SectionTitle>Avvisi prioritari ({alerts.length})</SectionTitle>
        {alerts.map((a, i) => (
          <AlertCard key={i} {...a} onAction={() => onNav(a.nav)} />
        ))}

        <SectionTitle style={{ marginTop: 16 }}>Rapporto per fascia d'eta</SectionTitle>
        {[
          { label: "Lattanti (0-12 mesi)", bambini: today.bambini.lattanti, educs: 1, max: 5, norm: "1:5" },
          { label: "Semidivezzi (13-24 mesi)", bambini: today.bambini.semidivezzi, educs: 1, max: 8, norm: "1:8" },
          { label: "Divezzi (25-36 mesi)", bambini: today.bambini.divezzi, educs: 1, max: 10, norm: "1:10" },
        ].map(r => {
          const ratio = r.bambini;
          const pct = Math.min((ratio / r.max) * 100, 100);
          const s = ratio > r.max ? "danger" : ratio >= r.max * 0.85 ? "warn" : "ok";
          return (
            <Card key={r.label} style={{ marginBottom: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{r.label}</span>
                <Pill label={(r.bambini) + " bimbi . max " + (r.norm)} status={s} small />
              </div>
              <div style={{ background: C.grayLight, borderRadius: 4, height: 6, overflow: "hidden" }}>
                <div style={{ width: (pct) + "%", height: "100%", background: statusColor(s), borderRadius: 4, transition: "width 0.5s" }} />
              </div>
            </Card>
          );
        })}

        <button onClick={() => onNav("ai")} style={{
          width: "100%", marginTop: 4, padding: "12px",
          background: C.green, color: "white", border: "none",
          borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
          letterSpacing: 0.3,
        }}>
          Chiedi a Katia 
        </button>
      </div>
    </div>
  );
}

// Personale
function PersonaleScreen({ onSelectPerson }) {
  return (
    <div>
      <SectionTitle>Staff ({STAFF.length} persone)</SectionTitle>
      {STAFF.map(p => {
        const s = overallStatus(p);
        const dangerDocs = p.docs.filter(d => d.status === "danger");
        const warnDocs = p.docs.filter(d => d.status === "warn");
        return (
          <Card key={p.id} onClick={() => onSelectPerson(p)}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <Avatar initials={p.initials} status={s} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                  <Pill label={p.contract} status={p.contractExpiry && daysUntil(p.contractExpiry) < 60 ? "warn" : "ok"} small />
                </div>
                <div style={{ fontSize: 11, color: C.textMuted, margin: "2px 0 7px" }}>{p.role}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  <Pill label={p.titolo.label} status={p.titolo.status} small />
                  {dangerDocs.map(d => <Pill key={d.name} label={(d.name) + " scaduto"} status="danger" small />)}
                  {warnDocs.map(d => <Pill key={d.name} label={(d.name) + " scade " + (fmtDate(d.expiry))} status="warn" small />)}
                  {dangerDocs.length === 0 && warnDocs.length === 0 && p.titolo.status === "ok" && (
                    <Pill label="Tutto in regola" status="ok" small />
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
      <button style={{
        width: "100%", padding: "11px", background: "transparent",
        border: "1px dashed " + (C.grayMid), borderRadius: 10,
        color: C.textMuted, fontSize: 13, cursor: "pointer",
      }}>+ Aggiungi dipendente</button>
    </div>
  );
}

// Dettaglio persona
function PersonDetailScreen({ person, onBack, onAI }) {
  const s = overallStatus(person);
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.green, fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "0 0 12px", display: "flex", alignItems: "center", gap: 4 }}>
        &lt;- Torna al personale
      </button>

      {/* header */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <Avatar initials={person.initials} status={s} size={52} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, fontFamily: "'DM Serif Display', serif" }}>{person.name}</div>
          <div style={{ fontSize: 12, color: C.textMuted }}>{person.role}</div>
          <div style={{ marginTop: 4 }}>
            <Pill label={"Contratto " + (person.contract) + (person.contractExpiry ? " . scade " + fmtDate(person.contractExpiry) : "")}
              status={person.contractExpiry && daysUntil(person.contractExpiry) < 60 ? "warn" : "ok"} small />
          </div>
        </div>
      </div>

      <SectionTitle>Titolo di studio</SectionTitle>
      <Card style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{person.titolo.label}</div>
            {person.titolo.status === "warn" && (
              <div style={{ fontSize: 11, color: C.amber, marginTop: 3 }}>
                Verificare equiparazione DGR Lombardia XI/4235/2021
              </div>
            )}
          </div>
          <Pill label={person.titolo.status === "ok" ? "Idoneo" : "Da verificare"} status={person.titolo.status} />
        </div>
      </Card>

      <SectionTitle>Documenti e formazione</SectionTitle>
      {person.docs.map(doc => {
        const days = daysUntil(doc.expiry);
        return (
          <Card key={doc.name} style={{ padding: "10px 12px", marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.name}</div>
                {doc.expiry && (
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                    Scadenza: {fmtDate(doc.expiry)}
                    {days !== null && days < 60 && (
                      <span style={{ color: statusColor(doc.status), fontWeight: 600 }}>
                        {" "}({days < 0 ? "scaduto " + (Math.abs(days)) + "gg fa" : "tra " + (days) + "gg"})
                      </span>
                    )}
                  </div>
                )}
                {!doc.expiry && <div style={{ fontSize: 11, color: C.textMuted }}>Nessuna scadenza</div>}
              </div>
              <Pill label={doc.status === "ok" ? "Valido" : doc.status === "warn" ? "In scadenza" : "Scaduto"} status={doc.status} />
            </div>
          </Card>
        );
      })}

      <button onClick={() => onAI("Analizza la situazione documentale di " + (person.name) + " e dimmi cosa devo fare per metterla in regola")}
        style={{
          width: "100%", marginTop: 8, padding: "12px",
          background: C.greenLight, color: C.greenDark,
          border: "1px solid " + (C.greenMid) + "50", borderRadius: 10,
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
        Analizza con Katia 
      </button>
    </div>
  );
}

// Formazione
function FormazioneScreen({ onAI }) {
  const corsi = [
    {
      nome: "Antincendio (rischio basso)", cadenza: "5 anni",
      records: STAFF.flatMap(p => p.docs.filter(d => d.name === "Antincendio").map(d => ({ ...d, person: p.name }))),
    },
    {
      nome: "HACCP - Igiene alimentare", cadenza: "Annuale",
      records: STAFF.flatMap(p => p.docs.filter(d => d.name === "HACCP").map(d => ({ ...d, person: p.name }))),
    },
    {
      nome: "Sicurezza D.Lgs 81/08", cadenza: "5 anni",
      records: STAFF.flatMap(p => p.docs.filter(d => d.name === "Sicurezza D.Lgs 81").map(d => ({ ...d, person: p.name }))),
    },
    {
      nome: "Primo soccorso", cadenza: "3 anni",
      records: STAFF.flatMap(p => p.docs.filter(d => d.name === "Primo soccorso").map(d => ({ ...d, person: p.name }))),
    },
  ];

  return (
    <div>
      <SectionTitle>Monitoraggio corsi obbligatori</SectionTitle>
      {corsi.map(c => {
        const worstStatus = c.records.some(r => r.status === "danger") ? "danger"
          : c.records.some(r => r.status === "warn") ? "warn" : "ok";
        return (
          <Card key={c.nome} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.nome}</div>
                <div style={{ fontSize: 11, color: C.textMuted }}>Rinnovo ogni {c.cadenza}</div>
              </div>
              <Pill label={worstStatus === "ok" ? "OK" : worstStatus === "warn" ? "Attenzione" : "Urgente"} status={worstStatus} />
            </div>
            {c.records.map(r => (
              <div key={r.person} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "5px 0", borderTop: "0.5px solid #f0efe8",
              }}>
                <span style={{ fontSize: 12, color: C.textMuted }}>{r.person}</span>
                <Pill label={r.expiry ? fmtDate(r.expiry) : "-"} status={r.status} small />
              </div>
            ))}
          </Card>
        );
      })}

      <SectionTitle>Titoli di studio - verifica idoneita</SectionTitle>
      {STAFF.filter(p => p.titolo.status !== "ok" || p.role.toLowerCase().includes("educ")).map(p => (
        <Card key={p.id} style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{p.titolo.label}</div>
            </div>
            <Pill label={p.titolo.status === "ok" ? "Idoneo" : "Da verificare"} status={p.titolo.status} />
          </div>
        </Card>
      ))}

      <button onClick={() => onAI("Quali sono i titoli di studio validi per educatore di asilo nido in Lombardia nel 2026?")}
        style={{
          width: "100%", marginTop: 8, padding: "12px",
          background: C.blueLight, color: C.blue,
          border: "1px solid " + (C.blue) + "40", borderRadius: 10,
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
        Chiedi a Katia 
      </button>
    </div>
  );
}

// Presenze
function PresenzeScreen({ onAI }) {
  const [selectedDay, setSelectedDay] = useState("Mar 22/04");
  const days = Object.keys(PRESENZE);
  const day = PRESENZE[selectedDay];
  const totalBimbi = Object.values(day.bambini).reduce((a, b) => a + b, 0);

  const fasceDAge = [
    { label: "Lattanti\n0-12 mesi", key: "lattanti", max: 5 },
    { label: "Semidivezzi\n13-24 mesi", key: "semidivezzi", max: 8 },
    { label: "Divezzi\n25-36 mesi", key: "divezzi", max: 10 },
  ];

  const check = (bambini, educs, max) => {
    const needed = Math.ceil(bambini / max);
    return educs >= needed ? "ok" : "danger";
  };

  return (
    <div>
      <SectionTitle>Seleziona giorno</SectionTitle>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
        {days.map(d => {
          const dd = PRESENZE[d];
          const total = Object.values(dd.bambini).reduce((a, b) => a + b, 0);
          const hasIssue = dd.educs < 3 || total / dd.educs > 7;
          return (
            <button key={d} onClick={() => setSelectedDay(d)} style={{
              flexShrink: 0, padding: "8px 10px", borderRadius: 10, cursor: "pointer",
              border: selectedDay === d ? "2px solid " + (C.green) : "0.5px solid #e0dfd8",
              background: selectedDay === d ? C.greenLight : C.white,
              textAlign: "center", minWidth: 60,
            }}>
              <div style={{ fontSize: 10, color: selectedDay === d ? C.greenDark : C.textMuted, fontWeight: 600 }}>
                {d.split(" ")[0]}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: selectedDay === d ? C.green : C.text, marginTop: 1 }}>
                {d.split(" ")[1]}
              </div>
              {hasIssue && <div style={{ width: 6, height: 6, borderRadius: 3, background: C.amber, margin: "3px auto 0" }} />}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Bambini totali", val: totalBimbi, s: "ok" },
          { label: "Educatrici", val: day.educs, s: day.educs < 3 ? "danger" : "ok" },
          { label: "Rapporto medio", val: "1:" + ((totalBimbi / day.educs).toFixed(1)), s: "ok" },
        ].map(s => (
          <div key={s.label} style={{
            background: statusBg(s.s), borderRadius: 10, padding: "10px 8px", textAlign: "center",
          }}>
            <div style={{ fontSize: 9, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: statusColor(s.s), fontFamily: "'DM Serif Display', serif" }}>{s.val}</div>
          </div>
        ))}
      </div>

      <SectionTitle>Verifica rapporti per fascia</SectionTitle>
      {fasceDAge.map(f => {
        const bambini = day.bambini[f.key];
        const needed = Math.ceil(bambini / f.max);
        const s = check(bambini, day.educs, f.max);
        const pct = Math.min((bambini / (f.max * Math.floor(day.educs / fasceDAge.length + 1))) * 100, 100);
        return (
          <Card key={f.key} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{f.label.split("\n")[0]}</div>
                <div style={{ fontSize: 10, color: C.textMuted }}>{f.label.split("\n")[1]}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <Pill label={(bambini) + " bambini"} status={s} small />
                <div style={{ fontSize: 10, color: C.textMuted, marginTop: 3 }}>min {needed} educ. . limite 1:{f.max}</div>
              </div>
            </div>
            <div style={{ background: C.grayLight, borderRadius: 4, height: 5, overflow: "hidden" }}>
              <div style={{ width: (Math.min(pct, 100)) + "%", height: "100%", background: statusColor(s), borderRadius: 4 }} />
            </div>
          </Card>
        );
      })}

      {day.educs < 3 && (
        <AlertCard type="danger"
          title="Copertura insufficiente"
          text={"Con solo " + (day.educs) + " educatrici per " + (totalBimbi) + " bambini, il rapporto potrebbe non rispettare i limiti di legge. Contattare una sostituta."}
        />
      )}

      <button onClick={() => onAI("Analizza le presenze di " + (selectedDay) + ": " + (totalBimbi) + " bambini e " + (day.educs) + " educatrici. Siamo in regola con la DGR Lombardia?")}
        style={{
          width: "100%", marginTop: 8, padding: "12px",
          background: C.green, color: "white", border: "none",
          borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
        Chiedi a Katia 
      </button>
    </div>
  );
}

// AI Assistant
const SYSTEM_PROMPT = "Sei Katia, la consulente virtuale esperta di NidoDoc - la piattaforma italiana per la compliance degli asili nido.\nSei specializzata nella normativa italiana per asili nido e servizi educativi 0-6 anni, con focus su Lombardia ma competente su tutte le regioni italiane.\nTono: professionale, caldo, diretto - come una collega esperta che vuole davvero aiutarti a stare tranquilla durante le ispezioni.\n\n----------------------------------------\nNORMATIVA FONDAMENTALE - STRUTTURA E AUTORIZZAZIONE\n----------------------------------------\n\nLOMBARDIA - Riferimenti principali:\n- L.R. Lombardia n. 7/2004 \"Riordino dei servizi alla persona\": disciplina i nidi d'infanzia privati\n- DGR VIII/6674/2008: requisiti minimi strutturali e organizzativi per l'autorizzazione\n- DGR XI/4235/2021 (aggiornamento): standard attuali per asili nido, micronidi, nidi famiglia\n- Spazio minimo: 6 mq/bambino per spazi interni, area esterna obbligatoria\n- Capienza massima: nido standard max 60 bambini; micronido max 10 bambini\n- Autorizzazione: rilasciata dal Comune, vigilanza ATS\n\nNAZIONALE:\n- D.Lgs 65/2017: sistema integrato educazione 0-6 anni, delega alle Regioni\n- D.P.C.M. 7/12/2017: fabbisogni standard servizi educativi\n- L. 107/2015 (La Buona Scuola): art. 1 commi 181-184 per sistema 0-6\n\n----------------------------------------\nRAPPORTI NUMERICI BAMBINI/EDUCATORI\n----------------------------------------\n\nLOMBARDIA (DGR XI/4235/2021):\n- Lattanti (0-12 mesi): 1 educatore ogni 5 bambini (1:5)\n- Semidivezzi (13-24 mesi): 1 educatore ogni 8 bambini (1:8)  \n- Divezzi (25-36 mesi): 1 educatore ogni 10 bambini (1:10)\n- Micronido: 1 educatore ogni 5 bambini indipendentemente dall'eta\n- Durante il riposo pomeridiano: possibile presenza di 1 solo operatore se bambini dormono\n- Il rapporto va garantito durante l'orario di massima frequenza\n- Compresenza: obbligatoria nelle fasce orarie di punta (entrata/uscita)\n\nALTRE REGIONI (per riferimento):\n- Piemonte (L.R. 8/2012): lattanti 1:5, semidivezzi 1:8, divezzi 1:10\n- Veneto (L.R. 22/2002): lattanti 1:5, semidivezzi 1:7, divezzi 1:9\n- Emilia-Romagna (L.R. 26/2001): lattanti 1:6, medi 1:8, grandi 1:10\n- Toscana (L.R. 32/2002): 1 educatore ogni 6 bambini (tutte le eta)\n- Se non conosci la regione specifica, usa web search per verificare\n\n----------------------------------------\nTITOLI DI STUDIO - EDUCATORI\n----------------------------------------\n\nTITOLI VALIDI per educatore di nido (D.Lgs 65/2017 + DM 378/2023):\n[OK] Laurea magistrale LM-50 (Programmazione e gestione servizi educativi)\n[OK] Laurea magistrale LM-57 (Scienze dell'educazione degli adulti e formazione continua)\n[OK] Laurea magistrale LM-85 (Scienze pedagogiche)\n[OK] Laurea magistrale LM-93 (Teorie e metodologie dell'e-learning e della media education)\n[OK] Laurea triennale L-19 (Scienze dell'educazione e della formazione) + tirocinio specifico\n[OK] Diploma magistrale (istituto magistrale) conseguito entro l'a.s. 2001/2002\n[OK] Diploma di maturita magistrale ante 2001/2002\n[OK] Diploma di dirigente di comunita\n[OK] Laurea in Scienze della Formazione Primaria (quinquennale)\n\nTITOLI DA VERIFICARE:\n[ATTENZIONE] Diplomi IeFP (Istruzione e Formazione Professionale): validi SOLO se equiparati da specifica DGR regionale - in Lombardia verificare con ATS competente\n[ATTENZIONE] Lauree triennali in psicologia, sociologia: NON sufficienti da sole, serve integrazione\n[ATTENZIONE] Titoli esteri: necessario riconoscimento MIUR\n\nPERSONALE AUSILIARIO (cuochi, collaboratori):\n- Non richiedono titoli specifici per l'educazione\n- Obbligo HACCP, sicurezza D.Lgs 81/08\n\n----------------------------------------\nFORMAZIONE OBBLIGATORIA\n----------------------------------------\n\n1. SICUREZZA SUL LAVORO (D.Lgs 81/2008):\n- Formazione generale lavoratori: 4 ore (valida a vita se non cambiano mansioni)\n- Formazione specifica rischio BASSO: 4 ore aggiuntive - asili nido = rischio BASSO\n- Aggiornamento: 6 ore ogni 5 anni\n- Preposto: 8 ore + aggiornamento 6 ore ogni 2 anni\n- RSPP interno: corso specifico (16-48 ore secondo rischio)\n- RLS (Rappresentante Lavoratori Sicurezza): 32 ore + 4 ore/anno aggiornamento\n\n2. ANTINCENDIO (DM 2/9/2021 - in vigore dal 4/10/2023):\n- Rischio BASSO (asili nido standard): 4 ore teoria - rinnovo ogni 5 anni\n- Rischio MEDIO: 8 ore - rinnovo ogni 3 anni\n- Rischio ALTO: 16 ore - rinnovo ogni 2 anni\n- Gli asili nido rientrano generalmente nel rischio BASSO salvo valutazione DVR\n- Attestato deve indicare: nome, data, ente formatore accreditato, livello rischio\n\n3. PRIMO SOCCORSO (D.M. 388/2003):\n- Aziende gruppo B e C (asili nido): 12 ore\n- Rinnovo: ogni 3 anni con 4 ore di aggiornamento\n- Almeno 1 addetto ogni turno di lavoro\n\n4. HACCP - IGIENE ALIMENTARE (Reg. CE 852/2004 + Accordo Stato-Regioni 2006):\n- Obbligatorio per chi manipola alimenti (cuochi, chi prepara merende)\n- Lombardia: rinnovo formazione ogni 2 anni (verifica con ASL competente)\n- Il Piano HACCP aziendale deve essere aggiornato annualmente\n- Responsabile HACCP (proprietario/coordinatore): formazione piu approfondita\n- Attestato deve indicare: argomenti trattati, ore, data, firma responsabile\n\n5. PRIVACY (GDPR - Reg. UE 2016/679):\n- Formazione obbligatoria per tutti i dipendenti che trattano dati personali bambini/famiglie\n- Nomina DPO (Data Protection Officer) consigliata ma non obbligatoria per strutture piccole\n- Registro trattamenti obbligatorio\n\n----------------------------------------\nCONTRATTI DI LAVORO\n----------------------------------------\n\nCCNL applicabili agli asili nido privati:\n- CCNL FISM (Federazione Italiana Scuole Materne): il piu diffuso\n- CCNL AGIDAE (Associazione Gestori Istituti Dipendenti Autorita Ecclesiastica)\n- CCNL ANINSEI (Associazioni Nazionali Istituti Non Statali)\n- CCNL Cooperative Sociali (se struttura e cooperativa)\n- CCNL Commercio (meno comune, sconsigliato per educatori)\n\nCONTRATTI A TERMINE:\n- Max 24 mesi consecutivi (D.Lgs 81/2015 modificato L. 96/2018)\n- Causali obbligatorie dopo i primi 12 mesi\n- Proroghe: max 4 proroghe nei 24 mesi\n- Conversione automatica in indeterminato se si supera il limite\n\nADEMPIMENTI ASSUNZIONE:\n- Comunicazione obbligatoria al Centro per l'Impiego entro il giorno prima dell'inizio\n- Visita medica preventiva (D.Lgs 81/2008 art. 41)\n- Consegna DVR e informazione rischi\n- Certificato penale del casellario giudiziale (obbligatorio per chi lavora con minori - L. 172/2012)\n\n----------------------------------------\nISPEZIONE ATS - DOCUMENTAZIONE RICHIESTA\n----------------------------------------\n\nCARTELLA DOCUMENTALE DA TENERE SEMPRE PRONTA:\n- Autorizzazione al funzionamento aggiornata (con eventuali variazioni)\n- Progetto educativo annuale aggiornato\n- Contratti di lavoro di tutto il personale in servizio\n- Titoli di studio originali o copie conformi di tutti gli educatori\n- Attestati antincendio (con data, livello rischio, ente formatore)\n- Attestati primo soccorso\n- Attestati sicurezza D.Lgs 81/08 (generale + specifica)\n- Certificati HACCP del personale di cucina\n- Piano HACCP aziendale aggiornato\n- DVR (Documento Valutazione Rischi) aggiornato\n- Nomina RSPP, RLS, Medico Competente\n- Registro presenze bambini (ultimi 6 mesi)\n- Registro presenze educatori/turni\n- Polizza assicurativa RC in corso di validita\n- Certificati penali del personale (L. 172/2012)\n- Registro infortuni\n- Piano evacuazione + verbali prove evacuazione (almeno 2/anno)\n- Manutenzione attrezzature e impianti (libretti)\n\nPROCEDURA IN CASO DI ISPEZIONE:\n1. Accogliere l'ispettore con cortesia\n2. Chiedere di identificarsi e mostrare il tesserino\n3. Accompagnarlo durante la visita\n4. Non firmare mai verbali senza averli letti attentamente\n5. In caso di prescrizioni: chiedere i termini per la regolarizzazione\n6. Entro i termini: inviare documentazione sanante via PEC\n\nSANZIONI TIPICHE:\n- Prima irregolarita documentale: prescrizione con termine 30-90 giorni\n- Recidiva: sanzione amministrativa EUR500-EUR5.000\n- Irregolarita gravi (rapporti non rispettati): sospensione temporanea\n- Gravissime: revoca autorizzazione\n\n----------------------------------------\nASPETTI FISCALI E CONTRIBUTIVI\n----------------------------------------\n\nPER LE FAMIGLIE:\n- Detrazione IRPEF 19% spese asilo nido: max EUR632/anno per figlio (art. 1 c. 335 L. 266/2005)\n- Bonus asilo nido INPS 2024: fino a EUR3.000/anno (ISEE fino EUR25.000), EUR2.500 (ISEE 25.001-40.000), EUR1.500 (ISEE oltre EUR40.000)\n- Fondo 0-6: contributi regionali variabili per strutture accreditate\n\nPER LA STRUTTURA:\n- IVA: servizi educativi esenti IVA ex art. 10 DPR 633/72 se autorizzati\n- IRAP: agevolazioni per cooperative sociali\n- Contributi INPS educatori: aliquota ordinaria (dipendenti privati)\n- Agevolazioni assunzione: contratti apprendistato, decontribuzione Sud, bonus assunzione under 36\n\n----------------------------------------\nPEC - COMUNICAZIONI UFFICIALI\n----------------------------------------\n\nQUANDO USARE LA PEC:\n- Invio documentazione ad ATS per ispezioni o accreditamento\n- Risposta a verbali di prescrizione (obbligatoriamente via PEC)\n- Comunicazioni al Comune (variazioni organico, modifiche strutturali)\n- Comunicazioni INPS, ITL, centri per l'impiego\n- Qualsiasi comunicazione con valore legale\n\nTERMINI DI RISPOSTA:\n- Prescrizione ATS: rispondere entro il termine indicato nel verbale (di solito 30-90 giorni)\n- Comunicazioni INPS: entro 30 giorni dalla ricezione\n- Variazioni organico al Comune: entro 30 giorni dalla variazione\n\n----------------------------------------\nANALISI DOCUMENTI - ISTRUZIONI DETTAGLIATE\n----------------------------------------\n\nQuando l'utente carica un documento (foto, PDF, immagine):\n\nSTEP 1 - IDENTIFICAZIONE\nIdentifica il tipo: contratto di lavoro / attestato formazione / diploma / certificato HACCP / autorizzazione / verbale ATS / altro\n\nSTEP 2 - VERIFICA COMPLETEZZA\nControlla presenza di: intestazione, dati anagrafici completi, data, firma datore/responsabile, firma lavoratore, timbro ente (per attestati), numero protocollo (per atti ufficiali)\n\nSTEP 3 - VALIDITA TEMPORALE\nCalcola se il documento e ancora valido rispetto alla data odierna. Segnala scadenze entro 60 giorni come URGENTI.\n\nSTEP 4 - CONFORMITA NORMATIVA\nVerifica che il contenuto rispetti la normativa specifica (es: attestato antincendio deve indicare il livello di rischio; contratto deve citare il CCNL applicato)\n\nSTEP 5 - VERDETTO FINALE\n[OK] CONFORME - documento valido e completo\n[ATTENZIONE] DA INTEGRARE - valido ma mancano elementi (specifica cosa)\n[NON VALIDO] NON VALIDO - scaduto, incompleto o non conforme (specifica perche' e cosa fare)\n\nSTEP 6 - AZIONE CONSIGLIATA\nIndica esattamente cosa fare: rinnovare, integrare, richiedere correzione, ecc.\n\n----------------------------------------\nREGOLE FONDAMENTALI DI RISPOSTA\n----------------------------------------\n\n1. Presentati sempre come Katia di NidoDoc\n2. Usa SEMPRE riferimenti normativi precisi (numero decreto, articolo, comma)\n3. Quando cerchi normative aggiornate via web, segnala \"ho verificato: aggiornato al [data]\"\n4. Se una norma potrebbe essere cambiata, CERCA SUL WEB prima di rispondere\n5. Sii concisa ma completa - usa elenchi puntati, non muri di testo\n6. Chiudi SEMPRE con 1 azione concreta immediata da fare\n7. Se non sei sicura al 100%: dillo chiaramente + suggerisci di verificare con ATS o consulente del lavoro\n8. Mai inventare normative - meglio dire \"verifica con ATS\" che dare info errate\n9. Per domande fiscali complesse: suggerisci sempre un commercialista\n10. Per domande legali sui contratti: suggerisci sempre un consulente del lavoro\n";

// Converte file in base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Determina media_type dal file
function getMediaType(file) {
  const t = file.type;
  if (t === "application/pdf") return "application/pdf";
  if (t.startsWith("image/")) return t;
  return "image/jpeg";
}

function AIScreen({ initialMessage }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Ciao! Sono Katia \n\nSono la tua consulente virtuale per la normativa degli asili nido in Lombardia, sempre aggiornata sulle ultime disposizioni.\n\nPosso aiutarti con:\n- Ispezioni ATS e documentazione richiesta\n- Verifica titoli di studio educatori\n- Corsi obbligatori (antincendio, HACCP, sicurezza)\n- Rapporti bambini/educatrici per legge\n- Contratti e aspetti fiscali\n-  Analisi di documenti - carica un file e lo verifico\n\nDimmi pure - sono qui!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [loadingLabel, setLoadingLabel] = useState("Katia sta analizzando...");
  const messagesEnd = useRef(null);
  const processedInitial = useRef(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialMessage && !processedInitial.current) {
      processedInitial.current = true;
      handleSend(initialMessage);
    }
  }, [initialMessage]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const processed = await Promise.all(files.map(async (f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
      base64: await fileToBase64(f),
      mediaType: getMediaType(f),
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    })));
    setPendingFiles(prev => [...prev, ...processed]);
    e.target.value = "";
  };

  const removeFile = (idx) => setPendingFiles(prev => prev.filter((_, i) => i !== idx));

  const buildUserContent = (text, files) => {
    if (!files.length) return text;
    const parts = [];
    files.forEach(f => {
      if (f.mediaType === "application/pdf") {
        parts.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: f.base64 } });
      } else {
        parts.push({ type: "image", source: { type: "base64", media_type: f.mediaType, data: f.base64 } });
      }
    });
    if (text) parts.push({ type: "text", text });
    else parts.push({ type: "text", text: "Analizza questo documento e dimmi se e conforme alla normativa vigente per asili nido in Lombardia. Verifica completezza, validita e conformita." });
    return parts;
  };

  const handleSend = async (text, filesToSend) => {
    const q = typeof text === "string" ? text.trim() : (input.trim());
    const files = filesToSend || pendingFiles;
    if (!q && !files.length) return;
    if (loading) return;

    setInput("");
    setPendingFiles([]);

    const userContent = buildUserContent(q, files);
    const displayText = q || (files.length ? "[clip] " + files.map(f => f.name).join(", ") : "");
    const displayFiles = files;

    const newMessages = [
      ...messages,
      { role: "user", content: userContent, displayText, displayFiles }
    ];
    setMessages(newMessages);
    setLoading(true);

    if (files.length) {
      setLoadingLabel("Katia sta analizzando il documento...");
    } else {
      setLoadingLabel("Katia sta verificando le normative aggiornate...");
    }

    try {
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.role === "user" ? m.content : m.content,
      }));

      const body = {
        model: "claude-sonnet-4-5",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: apiMessages,
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
        }],
      };

      const res = await fetch("https://nidodoc-proxy-production.up.railway.app/api/katia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      console.log("Katia response:", JSON.stringify(data).slice(0, 200));

      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Errore API: " + (data.error.message || JSON.stringify(data.error)) }]);
        setLoading(false);
        return;
      }

      // Raccogli tutto il testo dalla risposta (gestisce tool_use + text)
      const reply = (data.content || [])
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join("\n") || "Errore nella risposta.";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Katia error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "Errore: " + err.message }]);
    }
    setLoading(false);
  };

  const quickQ = [
    "Checklist ispezione ATS",
    "Titoli di studio validi Lombardia",
    "Antincendio scaduto: rischi?",
    "Rapporto bambini/educatrici oggi",
    "Rinnovo HACCP: quando e come?",
    "Bonus asilo nido INPS 2026",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Katia header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 2px 12px", marginBottom: 4,
        borderBottom: "0.5px solid #e8e7e0",
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "linear-gradient(135deg, #D85A30 0%, #BA7517 100%)",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, fontWeight: 700, fontFamily: "'DM Serif Display', serif", flexShrink: 0,
        }}>K</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'DM Serif Display', serif" }}>Katia</div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Normativa aggiornata . Analisi documenti</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.greenMid, fontWeight: 600 }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: C.greenMid }} /> Online
        </div>
      </div>

      {/* messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 10, flexDirection: "column",
            alignItems: m.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{ display: "flex", gap: 7, alignItems: "flex-start", flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              {m.role === "assistant" && (
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", background: "#FAECE7",
                  color: "#993C1D", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 2,
                  fontFamily: "'DM Serif Display', serif",
                }}>K</div>
              )}
              <div style={{ maxWidth: "80%" }}>
                {/* preview allegati nel messaggio utente */}
                {m.displayFiles && m.displayFiles.length > 0 && (
                  <div style={{ marginBottom: 6, display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "flex-end" }}>
                    {m.displayFiles.map((f, fi) => (
                      <div key={fi} style={{
                        background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 10px",
                        display: "flex", alignItems: "center", gap: 6,
                        border: "0.5px solid rgba(255,255,255,0.3)",
                      }}>
                        {f.preview ? (
                          <img src={f.preview} alt={f.name} style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} />
                        ) : (
                          <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}></div>
                        )}
                        <div style={{ fontSize: 11, color: "white", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                      </div>
                    ))}
                  </div>
                )}
                {(m.displayText || typeof m.content === "string") && (
                  <div style={{
                    padding: "9px 12px",
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: m.role === "user" ? C.green : C.white,
                    border: m.role === "assistant" ? "0.5px solid #e0dfd8" : "none",
                    color: m.role === "user" ? "white" : C.text,
                    fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap",
                  }}>
                    {m.displayText || m.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 35 }}>
            <div style={{ padding: "9px 14px", background: C.white, border: "0.5px solid #e0dfd8", borderRadius: "14px 14px 14px 4px" }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 5 }}>{loadingLabel}</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#D85A30", animation: "bounce 1.2s infinite", animationDelay: (i * 0.2) + "s" }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* quick questions */}
      {messages.length <= 2 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Domande rapide</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {quickQ.map(q => (
              <button key={q} onClick={() => handleSend(q)} style={{
                fontSize: 11, padding: "5px 10px",
                background: C.offWhite, border: "0.5px solid #dcdbd4",
                borderRadius: 14, color: C.textMuted, cursor: "pointer", whiteSpace: "nowrap",
              }}>{q}</button>
            ))}
          </div>
        </div>
      )}

      {/* anteprima file in attesa */}
      {pendingFiles.length > 0 && (
        <div style={{ marginBottom: 8, padding: "8px 10px", background: C.amberLight, borderRadius: 10, border: "0.5px solid #EF9F2750" }}>
          <div style={{ fontSize: 10, color: C.amberDark, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 }}>
             {pendingFiles.length} file da inviare a Katia
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {pendingFiles.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: C.white, borderRadius: 8, padding: "5px 8px", border: "0.5px solid #dcdbd4" }}>
                {f.preview ? (
                  <img src={f.preview} alt={f.name} style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 }} />
                ) : (
                  <span style={{ fontSize: 18 }}></span>
                )}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>{(f.size / 1024).toFixed(0)} KB</div>
                </div>
                <button onClick={() => removeFile(i)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 14, padding: "0 2px" }}>x</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* input row */}
      <div style={{ borderTop: "0.5px solid #e8e7e0", paddingTop: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {/* allega file */}
          <button onClick={() => fileInputRef.current?.click()} style={{
            background: C.offWhite, border: "0.5px solid #dcdbd4", borderRadius: 10,
            padding: "10px 12px", cursor: "pointer", fontSize: 16, flexShrink: 0,
            color: pendingFiles.length ? C.amber : C.textMuted,
            position: "relative",
          }} title="Allega documento o foto">
            
            {pendingFiles.length > 0 && (
              <div style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: 4, background: C.amber }} />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.jpg,.jpeg,.png,.pdf"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={pendingFiles.length ? "Aggiungi una domanda o invia..." : "Domanda o allega un documento..."}
            style={{
              flex: 1, border: "0.5px solid #dcdbd4", borderRadius: 10,
              padding: "10px 12px", fontSize: 13, background: C.offWhite,
              color: C.text, outline: "none",
            }}
          />
          <button onClick={() => handleSend()} disabled={loading && !pendingFiles.length} style={{
            background: loading ? C.grayMid : C.green, color: "white",
            border: "none", borderRadius: 10, padding: "10px 14px",
            fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.15s", flexShrink: 0,
          }}>^</button>
        </div>
        <div style={{ fontSize: 10, color: C.textMuted, marginTop: 5, textAlign: "center" }}>
          Carica contratti, attestati, diplomi, certificati HACCP, foto di documenti
        </div>
      </div>
    </div>
  );
}


// -- PEC SCREEN ----------------------------------------------------------------

const PEC_DESTINATARI = [
  { id: "ats_milano", label: "ATS Milano Citta Metropolitana", pec: "protocollo@pec.ats-milano.it", tipo: "ATS" },
  { id: "ats_insubria", label: "ATS Insubria", pec: "ats-insubria@pec.it", tipo: "ATS" },
  { id: "ats_brianza", label: "ATS Brianza", pec: "protocollo@pec.ats-brianza.it", tipo: "ATS" },
  { id: "comune_milano", label: "Comune di Milano - Servizi Educativi", pec: "servizieducativi@pec.comune.milano.it", tipo: "Comune" },
  { id: "inps_lombardia", label: "INPS sede Lombardia", pec: "direzioneregionale.lombardia@postacert.inps.gov.it", tipo: "INPS" },
  { id: "dtl_milano", label: "Ispettorato Territoriale del Lavoro Milano", pec: "itl.milano@pec.lavoro.gov.it", tipo: "ITL" },
  { id: "personalizzato", label: "Destinatario personalizzato", pec: "", tipo: "Altro" },
];

const DOC_TEMPLATES = [
  {
    id: "ispezione_ats",
    label: "Documentazione per ispezione ATS",
    descrizione: "Raccolta completa documenti richiesti in sede di ispezione",
    documenti: [
      { id: "autorizzazione", label: "Autorizzazione al funzionamento", obbligatorio: true },
      { id: "contratti", label: "Contratti di lavoro tutto il personale", obbligatorio: true },
      { id: "titoli_studio", label: "Titoli di studio educatori", obbligatorio: true },
      { id: "attestati_antincendio", label: "Attestati antincendio", obbligatorio: true },
      { id: "attestati_haccp", label: "Certificati HACCP", obbligatorio: true },
      { id: "attestati_sicurezza", label: "Attestati sicurezza D.Lgs 81/08", obbligatorio: true },
      { id: "primo_soccorso", label: "Attestati primo soccorso", obbligatorio: true },
      { id: "registro_presenze", label: "Registro presenze bambini (ultimi 3 mesi)", obbligatorio: true },
      { id: "piano_haccp", label: "Piano HACCP aggiornato", obbligatorio: true },
      { id: "polizza", label: "Polizza assicurativa RC", obbligatorio: false },
      { id: "duvri", label: "DUVRI (se applicabile)", obbligatorio: false },
      { id: "regolamento", label: "Regolamento interno", obbligatorio: false },
    ],
  },
  {
    id: "richiesta_accreditamento",
    label: "Richiesta/rinnovo accreditamento regionale",
    descrizione: "Documentazione per accreditamento DGR Lombardia",
    documenti: [
      { id: "domanda", label: "Domanda di accreditamento compilata", obbligatorio: true },
      { id: "visura", label: "Visura camerale aggiornata", obbligatorio: true },
      { id: "planimetria", label: "Planimetria locali certificata", obbligatorio: true },
      { id: "cert_agibilita", label: "Certificato di agibilita", obbligatorio: true },
      { id: "nulla_osta_asl", label: "Nulla osta igienico-sanitario ASL", obbligatorio: true },
      { id: "certificato_prevenzione", label: "Certificato prevenzione incendi (CPI)", obbligatorio: true },
      { id: "lista_personale", label: "Elenco personale con qualifiche", obbligatorio: true },
      { id: "progetto_educativo", label: "Progetto educativo", obbligatorio: true },
    ],
  },
  {
    id: "comunicazione_variazioni",
    label: "Comunicazione variazioni personale",
    descrizione: "Notifica nuove assunzioni, cessazioni, variazioni contratto",
    documenti: [
      { id: "lettera_variazione", label: "Lettera comunicazione variazione", obbligatorio: true },
      { id: "nuovo_contratto", label: "Nuovo contratto / contratto cessato", obbligatorio: true },
      { id: "nuovo_titolo", label: "Titolo di studio nuovo dipendente", obbligatorio: false },
      { id: "nuovi_attestati", label: "Attestati formazione nuovo dipendente", obbligatorio: false },
    ],
  },
  {
    id: "risposta_prescrizione",
    label: "Risposta a verbale di prescrizione",
    descrizione: "Documentazione per chiudere una non conformita ATS",
    documenti: [
      { id: "lettera_risposta", label: "Lettera di risposta con azioni correttive", obbligatorio: true },
      { id: "doc_sanato", label: "Documento che sana la non conformita", obbligatorio: true },
      { id: "dichiarazione", label: "Dichiarazione del legale rappresentante", obbligatorio: true },
    ],
  },
];

const fmtNow = () => {
  const d = new Date("2026-04-27");
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
};

function PECScreen() {
  const [step, setStep] = useState("config"); // config | compose | preview | sent
  const [pecConfig, setPecConfig] = useState({
    mittente: "",
    nomeMittente: "Asilo Nido Il Girasole",
    configurata: false,
  });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedDest, setSelectedDest] = useState(null);
  const [customPec, setCustomPec] = useState("");
  const [oggetto, setOggetto] = useState("");
  const [corpo, setCorpo] = useState("");
  const [checkedDocs, setCheckedDocs] = useState({});
  const [allegati, setAllegati] = useState([]);
  const [storico, setStorico] = useState([
    {
      id: 1, data: "15/04/2026", dest: "ATS Milano Citta Metropolitana",
      oggetto: "Trasmissione documentazione ispezione del 15/04/2026",
      template: "Documentazione per ispezione ATS", stato: "consegnata",
    },
    {
      id: 2, data: "02/03/2026", dest: "Comune di Milano - Servizi Educativi",
      oggetto: "Comunicazione variazione organico educativo",
      template: "Comunicazione variazioni personale", stato: "consegnata",
    },
  ]);
  const [activeTab, setActiveTab] = useState("nuova"); // nuova | storico
  const fileRef = useRef(null);

  const toggleDoc = (id) => setCheckedDocs(prev => ({ ...prev, [id]: !prev[id] }));

  const selectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    const initial = {};
    tpl.documenti.forEach(d => { initial[d.id] = d.obbligatorio; });
    setCheckedDocs(initial);
    setOggetto(tpl.label + " - " + pecConfig.nomeMittente + " - " + fmtNow());
    setCorpo(
      "Gentili Signori,\n\ncon la presente la " + pecConfig.nomeMittente + " trasmette la documentazione relativa a:\n\n" + tpl.label + "\n\nIn allegato si trovano i documenti selezionati.\n\nRimanendo a disposizione per qualsiasi chiarimento,\n\nCordiali saluti\n" + pecConfig.nomeMittente
    );
    setStep("compose");
  };

  const destAddress = selectedDest?.id === "personalizzato" ? customPec : selectedDest?.pec;
  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;

  const handleSend = () => {
    const nuovoInvio = {
      id: storico.length + 1,
      data: "27/04/2026",
      dest: selectedDest?.label || "Destinatario",
      oggetto,
      template: selectedTemplate?.label || "",
      stato: "consegnata",
    };
    setStorico(prev => [nuovoInvio, ...prev]);
    setStep("sent");
  };

  // -- STEP: configurazione PEC ----------------------------------
  if (!pecConfig.configurata) {
    return (
      <div>
        <SectionTitle>Configura la tua PEC</SectionTitle>
        <div style={{ background: C.blueLight, border: "0.5px solid " + C.blue + "40", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: C.blue, marginBottom: 4 }}>Cos'e e perche' serve</div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>
            La Posta Elettronica Certificata (PEC) ha valore legale equivalente alla raccomandata A/R.
            Configurandola qui potrai inviare documenti direttamente ad ATS, Comuni, INPS e altri enti con
            piena tracciabilita' e ricevuta di consegna.
          </div>
        </div>

        <Card>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>
              Indirizzo PEC della struttura *
            </label>
            <input
              value={pecConfig.mittente}
              onChange={e => setPecConfig(p => ({ ...p, mittente: e.target.value }))}
              placeholder="asilonido@nomeprovider.pec.it"
              style={{
                width: "100%", border: "0.5px solid #dcdbd4", borderRadius: 8,
                padding: "10px 12px", fontSize: 13, background: C.offWhite,
                color: C.text, outline: "none",
              }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>
              Nome della struttura *
            </label>
            <input
              value={pecConfig.nomeMittente}
              onChange={e => setPecConfig(p => ({ ...p, nomeMittente: e.target.value }))}
              placeholder="Es: Asilo Nido Il Girasole"
              style={{
                width: "100%", border: "0.5px solid #dcdbd4", borderRadius: 8,
                padding: "10px 12px", fontSize: 13, background: C.offWhite,
                color: C.text, outline: "none",
              }}
            />
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, background: C.grayLight, borderRadius: 6, padding: "8px 10px", marginBottom: 14 }}>
             I dati PEC sono salvati localmente sul tuo dispositivo e non vengono condivisi. La password del provider PEC verra richiesta solo al momento dell'invio.
          </div>
          <button
            onClick={() => { if (pecConfig.mittente && pecConfig.nomeMittente) setPecConfig(p => ({ ...p, configurata: true })); }}
            disabled={!pecConfig.mittente || !pecConfig.nomeMittente}
            style={{
              width: "100%", padding: "12px", background: pecConfig.mittente ? C.green : C.grayMid,
              color: "white", border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: pecConfig.mittente ? "pointer" : "not-allowed",
            }}>
            Salva configurazione PEC
          </button>
        </Card>

        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8, fontWeight: 600 }}>Provider PEC supportati</div>
          {["Aruba PEC", "Legalmail (InfoCert)", "Namirial", "Poste CertifiedMail", "Register.it PEC", "Tim PEC"].map(p => (
            <span key={p} style={{ display: "inline-block", fontSize: 11, padding: "3px 8px", background: C.grayLight, borderRadius: 6, margin: "0 4px 4px 0", color: C.textMuted }}>{p}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* header PEC configurata */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "8px 12px", background: C.greenLight, borderRadius: 10, border: "0.5px solid " + C.greenMid + "40" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.greenDark }}>PEC attiva</div>
          <div style={{ fontSize: 11, color: C.green }}>{pecConfig.mittente}</div>
        </div>
        <button onClick={() => setPecConfig(p => ({ ...p, configurata: false }))} style={{ fontSize: 11, background: "none", border: "0.5px solid " + C.greenMid, color: C.green, borderRadius: 6, padding: "4px 8px", cursor: "pointer" }}>
          Modifica
        </button>
      </div>

      {/* tabs nuova/storico */}
      <div style={{ display: "flex", borderBottom: "0.5px solid #e8e7e0", marginBottom: 14 }}>
        {[{ id: "nuova", label: "Nuova PEC" }, { id: "storico", label: "Storico (" + storico.length + ")" }].map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setStep("config"); }} style={{
            padding: "8px 14px", background: "none", border: "none",
            borderBottom: activeTab === t.id ? "2px solid " + C.green : "2px solid transparent",
            color: activeTab === t.id ? C.green : C.textMuted,
            fontSize: 12, fontWeight: activeTab === t.id ? 700 : 400, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      {/* -- STORICO -- */}
      {activeTab === "storico" && (
        <div>
          <SectionTitle>Invii recenti</SectionTitle>
          {storico.map(s => (
            <Card key={s.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 600, flex: 1, marginRight: 8 }}>{s.oggetto}</div>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: C.greenLight, color: C.greenDark, fontWeight: 600, whiteSpace: "nowrap" }}>OK {s.stato}</span>
              </div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{s.dest}</div>
              <div style={{ fontSize: 10, color: C.grayMid, marginTop: 3 }}>{s.data} . {s.template}</div>
            </Card>
          ))}
        </div>
      )}

      {/* -- NUOVA PEC: selezione template -- */}
      {activeTab === "nuova" && step === "config" && (
        <div>
          <SectionTitle>Seleziona tipo di invio</SectionTitle>
          {DOC_TEMPLATES.map(tpl => (
            <Card key={tpl.id} onClick={() => { setSelectedTemplate(null); setSelectedDest(null); setStep("dest_" + tpl.id); }} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{tpl.label}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>{tpl.descrizione}</div>
              <div style={{ fontSize: 10, color: C.textMuted }}>
                {tpl.documenti.filter(d => d.obbligatorio).length} doc. obbligatori . {tpl.documenti.filter(d => !d.obbligatorio).length} facoltativi
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* -- SELEZIONE DESTINATARIO -- */}
      {activeTab === "nuova" && step.startsWith("dest_") && (
        <div>
          <button onClick={() => setStep("config")} style={{ background: "none", border: "none", color: C.green, fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "0 0 12px", display: "flex", alignItems: "center", gap: 4 }}>Torna</button>
          <SectionTitle>Seleziona destinatario</SectionTitle>
          {PEC_DESTINATARI.map(d => (
            <Card key={d.id} onClick={() => { setSelectedDest(d); if (d.id !== "personalizzato") { const tplId = step.replace("dest_", ""); const tpl = DOC_TEMPLATES.find(t => t.id === tplId); if (tpl) selectTemplate(tpl); } }} style={{ marginBottom: 6, cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{d.pec || "Inserisci indirizzo"}</div>
                </div>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: C.blueLight, color: C.blue, fontWeight: 600 }}>{d.tipo}</span>
              </div>
              {d.id === "personalizzato" && selectedDest?.id === "personalizzato" && (
                <div style={{ marginTop: 10 }}>
                  <input
                    value={customPec}
                    onChange={e => setCustomPec(e.target.value)}
                    placeholder="indirizzo@pec.it"
                    onClick={e => e.stopPropagation()}
                    style={{ width: "100%", border: "0.5px solid #dcdbd4", borderRadius: 8, padding: "8px 10px", fontSize: 12, background: C.offWhite, color: C.text, outline: "none" }}
                  />
                  <button
                    onClick={e => { e.stopPropagation(); const tplId = step.replace("dest_", ""); const tpl = DOC_TEMPLATES.find(t => t.id === tplId); if (tpl && customPec) selectTemplate(tpl); }}
                    style={{ marginTop: 8, width: "100%", padding: "8px", background: C.green, color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Continua 
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* -- COMPOSIZIONE -- */}
      {activeTab === "nuova" && step === "compose" && (
        <div>
          <button onClick={() => setStep("config")} style={{ background: "none", border: "none", color: C.green, fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "0 0 12px", display: "flex", alignItems: "center", gap: 4 }}>Torna</button>

          {/* destinatario */}
          <Card style={{ marginBottom: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>Destinatario</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedDest?.label}</div>
            <div style={{ fontSize: 11, color: C.blue }}>{destAddress}</div>
          </Card>

          {/* oggetto */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6 }}>Oggetto</label>
            <input value={oggetto} onChange={e => setOggetto(e.target.value)} style={{ width: "100%", border: "0.5px solid #dcdbd4", borderRadius: 8, padding: "9px 12px", fontSize: 13, background: C.offWhite, color: C.text, outline: "none" }} />
          </div>

          {/* corpo */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.6 }}>Testo</label>
            <textarea value={corpo} onChange={e => setCorpo(e.target.value)} rows={6} style={{ width: "100%", border: "0.5px solid #dcdbd4", borderRadius: 8, padding: "9px 12px", fontSize: 12, background: C.offWhite, color: C.text, outline: "none", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} />
          </div>

          {/* checklist documenti */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6 }}>Documenti da allegare</label>
              <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>{checkedCount} selezionati</span>
            </div>
            {selectedTemplate?.documenti.map(doc => (
              <div
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  background: checkedDocs[doc.id] ? C.greenLight : C.white,
                  border: "0.5px solid " + (checkedDocs[doc.id] ? C.greenMid + "80" : "#e0dfd8"),
                  borderRadius: 8, marginBottom: 5, cursor: "pointer",
                  transition: "all 0.15s",
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: "1.5px solid " + (checkedDocs[doc.id] ? C.green : C.grayMid),
                  background: checkedDocs[doc.id] ? C.green : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {checkedDocs[doc.id] && <div style={{ color: "white", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>OK</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: checkedDocs[doc.id] ? 600 : 400, color: checkedDocs[doc.id] ? C.greenDark : C.text }}>
                    {doc.label}
                  </div>
                </div>
                {doc.obbligatorio && (
                  <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 8, background: C.redLight, color: C.red, fontWeight: 600 }}>OBB.</span>
                )}
              </div>
            ))}
          </div>

          {/* allegati aggiuntivi */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.6 }}>File allegati</label>
              <button onClick={() => fileRef.current?.click()} style={{ fontSize: 11, padding: "4px 10px", background: C.offWhite, border: "0.5px solid #dcdbd4", borderRadius: 8, color: C.textMuted, cursor: "pointer" }}>+ Aggiungi file</button>
            </div>
            <input ref={fileRef} type="file" multiple accept="*/*" onChange={e => { setAllegati(prev => [...prev, ...Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }))]); e.target.value = ""; }} style={{ display: "none" }} />
            {allegati.length === 0 && (
              <div style={{ fontSize: 11, color: C.grayMid, fontStyle: "italic", padding: "8px 0" }}>Nessun file allegato</div>
            )}
            {allegati.map((f, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", background: C.offWhite, borderRadius: 8, marginBottom: 4, border: "0.5px solid #e0dfd8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}></span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{f.name}</div>
                    <div style={{ fontSize: 10, color: C.textMuted }}>{(f.size / 1024).toFixed(0)} KB</div>
                  </div>
                </div>
                <button onClick={() => setAllegati(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 16 }}>x</button>
              </div>
            ))}
          </div>

          {/* avviso doc obbligatori non spuntati */}
          {selectedTemplate?.documenti.filter(d => d.obbligatorio && !checkedDocs[d.id]).length > 0 && (
            <div style={{ background: C.amberLight, border: "0.5px solid " + C.amber + "50", borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.amberDark, marginBottom: 3 }}>(!) Documenti obbligatori non selezionati</div>
              {selectedTemplate.documenti.filter(d => d.obbligatorio && !checkedDocs[d.id]).map(d => (
                <div key={d.id} style={{ fontSize: 11, color: C.amber }}>- {d.label}</div>
              ))}
            </div>
          )}

          {/* bottone invio */}
          <button onClick={() => setStep("preview")} style={{
            width: "100%", padding: "13px", background: C.green, color: "white",
            border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700,
            cursor: "pointer", letterSpacing: 0.3,
          }}>
            Anteprima e invio 
          </button>
        </div>
      )}

      {/* -- PREVIEW -- */}
      {activeTab === "nuova" && step === "preview" && (
        <div>
          <button onClick={() => setStep("compose")} style={{ background: "none", border: "none", color: C.green, fontWeight: 600, fontSize: 13, cursor: "pointer", padding: "0 0 12px", display: "flex", alignItems: "center", gap: 4 }}>Modifica</button>
          <SectionTitle>Anteprima PEC</SectionTitle>

          <Card style={{ marginBottom: 12, fontFamily: "monospace" }}>
            <div style={{ fontSize: 11, marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.textMuted, minWidth: 60 }}>Da:</span><span style={{ fontWeight: 600 }}>{pecConfig.mittente}</span></div>
              <div style={{ display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.textMuted, minWidth: 60 }}>A:</span><span style={{ fontWeight: 600 }}>{destAddress}</span></div>
              <div style={{ display: "flex", gap: 6, marginBottom: 4 }}><span style={{ color: C.textMuted, minWidth: 60 }}>Oggetto:</span><span style={{ fontWeight: 600 }}>{oggetto}</span></div>
              <div style={{ display: "flex", gap: 6 }}><span style={{ color: C.textMuted, minWidth: 60 }}>Data:</span><span>{fmtNow()}</span></div>
            </div>
            <div style={{ borderTop: "0.5px solid #e8e7e0", paddingTop: 10, fontSize: 12, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.7, fontFamily: "inherit" }}>{corpo}</div>
          </Card>

          <SectionTitle>Allegati ({checkedCount + allegati.length})</SectionTitle>
          {selectedTemplate?.documenti.filter(d => checkedDocs[d.id]).map(d => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: C.greenLight, borderRadius: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}></span>
              <span style={{ fontSize: 12, color: C.greenDark }}>{d.label}</span>
              {d.obbligatorio && <span style={{ fontSize: 9, padding: "1px 5px", background: C.green, color: "white", borderRadius: 6, marginLeft: "auto" }}>OBB.</span>}
            </div>
          ))}
          {allegati.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: C.offWhite, borderRadius: 8, marginBottom: 4, border: "0.5px solid #e0dfd8" }}>
              <span style={{ fontSize: 14 }}></span>
              <span style={{ fontSize: 12 }}>{f.name}</span>
            </div>
          ))}

          <div style={{ background: C.blueLight, border: "0.5px solid " + C.blue + "40", borderRadius: 8, padding: "10px 12px", margin: "14px 0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, marginBottom: 3 }}>i Cosa succede dopo l'invio</div>
            <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
              Riceverai una ricevuta di accettazione dal tuo provider PEC, e successivamente una ricevuta di consegna. Entrambe hanno valore legale. L'invio viene registrato nello storico.
            </div>
          </div>

          <button onClick={handleSend} style={{
            width: "100%", padding: "13px", background: C.green, color: "white",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
            cursor: "pointer", letterSpacing: 0.3,
          }}>
            [PEC] Invia PEC ora
          </button>
        </div>
      )}

      {/* -- SENT -- */}
      {step === "sent" && (
        <div style={{ textAlign: "center", padding: "30px 16px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>[OK]</div>
          <div style={{ fontWeight: 700, fontSize: 18, fontFamily: "'DM Serif Display', serif", marginBottom: 8 }}>PEC inviata!</div>
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6, marginBottom: 8 }}>
            La PEC e stata inviata a <strong>{selectedDest?.label}</strong>.<br />
            Riceverai la ricevuta di consegna all'indirizzo <strong>{pecConfig.mittente}</strong>.
          </div>
          <div style={{ background: C.greenLight, borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: 12, color: C.greenDark }}>
            Oggetto: {oggetto}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setStep("config"); setActiveTab("storico"); }} style={{ flex: 1, padding: "11px", background: C.offWhite, border: "0.5px solid #dcdbd4", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.text }}>
              Vedi storico
            </button>
            <button onClick={() => { setStep("config"); setSelectedTemplate(null); setSelectedDest(null); setAllegati([]); setCheckedDocs({}); }} style={{ flex: 1, padding: "11px", background: C.green, color: "white", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Nuova PEC
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -- MAIN APP ------------------------------------------------------------------

// Hook per breakpoint responsive
function useBreakpoint() {
  const [bp, setBp] = useState(() => {
    const w = window.innerWidth;
    return w >= 1024 ? "desktop" : w >= 640 ? "tablet" : "mobile";
  });
  useEffect(() => {
    const fn = () => {
      const w = window.innerWidth;
      setBp(w >= 1024 ? "desktop" : w >= 640 ? "tablet" : "mobile");
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

export default function NidoDoc() {
  const [tab, setTab] = useState("dashboard");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [aiMessage, setAiMessage] = useState(null);
  const bp = useBreakpoint();


  const goToAI = (msg) => {
    setAiMessage(msg);
    setTab("ai");
  };

  const tabs = [
    { id: "dashboard", label: "Situazione", icon: "o" },
    { id: "personale", label: "Personale", icon: "o" },
    { id: "formazione", label: "Formazione", icon: "*" },
    { id: "presenze", label: "Presenze", icon: "#" },
    { id: "pec", label: "PEC", icon: "@" },
    { id: "ai", label: "Katia", icon: "*" },
  ];

  const totalAlerts = STAFF.reduce((acc, p) => {
    return acc + p.docs.filter(d => d.status !== "ok").length + (p.titolo.status !== "ok" ? 1 : 0);
  }, 0);

  const handleTabClick = (id) => {
    setTab(id);
    if (id !== "personale") setSelectedPerson(null);
    if (id !== "ai") setAiMessage(null);
  };

  const renderContent = () => {
    if (tab === "dashboard") return <DashboardScreen onNav={handleTabClick} />;
    if (tab === "personale" && !selectedPerson) return <PersonaleScreen onSelectPerson={(p) => setSelectedPerson(p)} />;
    if (tab === "personale" && selectedPerson) return <PersonDetailScreen person={selectedPerson} onBack={() => setSelectedPerson(null)} onAI={goToAI} />;
    if (tab === "formazione") return <FormazioneScreen onAI={goToAI} />;
    if (tab === "presenze") return <PresenzeScreen onAI={goToAI} />;
    if (tab === "pec") return <PECScreen />;
    if (tab === "ai") return <AIScreen initialMessage={aiMessage} />;
  };

  // -- MOBILE layout ----------------------------------------------
  if (bp === "mobile") {
    return (
      <div style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        maxWidth: 430, margin: "0 auto",
        background: C.offWhite, minHeight: "100dvh",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ background: C.green, padding: "14px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: "white", fontWeight: 700, fontSize: 17, fontFamily: "'DM Serif Display', serif", letterSpacing: -0.3 }}>NidoDoc</div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>
              {selectedPerson ? selectedPerson.name : "Asilo Nido Il Girasole . Milano"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {totalAlerts > 0 && <div style={{ background: C.red, color: "white", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>{totalAlerts} avvisi</div>}
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>CG</div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "14px 14px 0", overflowY: "auto" }}>
          {renderContent()}
        </div>

        <div style={{ display: "flex", borderTop: "0.5px solid #e0dfd8", background: C.white, padding: "6px 0 10px" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => handleTabClick(t.id)} style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 0",
            }}>
              <div style={{ fontSize: 16, color: tab === t.id ? C.green : C.grayMid }}>{t.icon}</div>
              <div style={{ fontSize: 9, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.green : C.grayMid }}>{t.label}</div>
              {t.id === "ai" && <div style={{ width: 4, height: 4, borderRadius: 2, background: "#D85A30", marginTop: -1 }} />}
            </button>
          ))}
        </div>
        <Fonts />
      </div>
    );
  }

  // -- TABLET layout ----------------------------------------------
  if (bp === "tablet") {
    return (
      <div style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "flex", height: "100dvh", background: C.offWhite,
      }}>
        {/* sidebar */}
        <div style={{
          width: 200, background: C.green, display: "flex", flexDirection: "column",
          padding: "20px 0", flexShrink: 0,
        }}>
          <div style={{ padding: "0 16px 24px" }}>
            <div style={{ color: "white", fontWeight: 700, fontSize: 19, fontFamily: "'DM Serif Display', serif" }}>NidoDoc</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2 }}>Il Girasole . Milano</div>
          </div>
          {tabs.map(t => (
            <button key={t.id} onClick={() => handleTabClick(t.id)} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "11px 16px", background: tab === t.id ? "rgba(255,255,255,0.15)" : "transparent",
              border: "none", cursor: "pointer", color: "white", fontSize: 13,
              fontWeight: tab === t.id ? 700 : 400, borderLeft: tab === t.id ? "3px solid white" : "3px solid transparent",
              transition: "background 0.15s",
            }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span>
              <span>{t.label}</span>
              {t.id === "ai" && <div style={{ width: 6, height: 6, borderRadius: 3, background: "#F0997B", marginLeft: "auto" }} />}
            </button>
          ))}
          <div style={{ marginTop: "auto", padding: "16px" }}>
            {totalAlerts > 0 && <div style={{ background: C.red, color: "white", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 8, textAlign: "center" }}>{totalAlerts} avvisi attivi</div>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>CG</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 11 }}>Carla Gatti<br /><span style={{ opacity: 0.6 }}>Coordinatrice</span></div>
            </div>
          </div>
        </div>
        {/* main */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ background: C.white, borderBottom: "0.5px solid #e0dfd8", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{tabs.find(t => t.id === tab)?.label}</div>
            {selectedPerson && <div style={{ fontSize: 12, color: C.textMuted }}>{selectedPerson.name}</div>}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {renderContent()}
          </div>
        </div>
        <Fonts />
      </div>
    );
  }

  // -- DESKTOP layout ----------------------------------------------
  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex", height: "100dvh", background: C.offWhite,
    }}>
      {/* sidebar larga */}
      <div style={{
        width: 240, background: C.green, display: "flex", flexDirection: "column",
        padding: "24px 0", flexShrink: 0,
      }}>
        <div style={{ padding: "0 20px 28px" }}>
          <div style={{ color: "white", fontWeight: 700, fontSize: 22, fontFamily: "'DM Serif Display', serif", letterSpacing: -0.5 }}>NidoDoc</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 3 }}>Asilo Nido Il Girasole . Milano</div>
        </div>
        {tabs.filter(t => t.id !== "ai").map(t => (
          <button key={t.id} onClick={() => handleTabClick(t.id)} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 20px", background: tab === t.id ? "rgba(255,255,255,0.15)" : "transparent",
            border: "none", cursor: "pointer", color: "white", fontSize: 14,
            fontWeight: tab === t.id ? 600 : 400,
            borderLeft: tab === t.id ? "3px solid white" : "3px solid transparent",
            transition: "background 0.15s", textAlign: "left",
          }}
            onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
            onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 16, width: 20 }}>{t.icon}</span>
            <span>{t.label}</span>
            {/* alert dot */}
          </button>
        ))}
        {totalAlerts > 0 && (
          <div style={{ margin: "12px 20px 0", background: "rgba(162,45,45,0.85)", color: "white", fontSize: 11, fontWeight: 600, padding: "8px 12px", borderRadius: 8 }}>
            (!) {totalAlerts} avvisi da gestire
          </div>
        )}
        <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "0.5px solid rgba(255,255,255,0.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>CG</div>
            <div>
              <div style={{ color: "white", fontSize: 12, fontWeight: 600 }}>Carla Gatti</div>
              <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>Coordinatrice</div>
            </div>
          </div>
        </div>
      </div>

      {/* contenuto centrale */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <div style={{ background: C.white, borderBottom: "0.5px solid #e0dfd8", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{tabs.find(t => t.id === tab)?.label}</div>
            {selectedPerson && <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Profilo di {selectedPerson.name}</div>}
          </div>
          <div style={{ fontSize: 11, color: C.textMuted }}>Lunedi 27 aprile 2026</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", maxWidth: 680 }}>
          {renderContent()}
        </div>
      </div>

      {/* pannello Katia fisso a destra - solo desktop */}
      <div style={{
        width: 320, borderLeft: "0.5px solid #e0dfd8",
        background: C.white, display: "flex", flexDirection: "column",
        flexShrink: 0,
      }}>
        {/* Katia header */}
        <div style={{ padding: "16px 16px 12px", borderBottom: "0.5px solid #e8e7e0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "linear-gradient(135deg, #D85A30 0%, #BA7517 100%)",
            color: "white", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 700, fontFamily: "'DM Serif Display', serif", flexShrink: 0,
          }}>K</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "'DM Serif Display', serif" }}>Katia</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>Consulente normativa</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: C.greenMid, fontWeight: 600 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: C.greenMid }} /> Online
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "8px 16px 16px" }}>
          <AIScreen initialMessage={aiMessage} />
        </div>
      </div>
      <Fonts />
    </div>
  );
}

function Fonts() {
  return (
    <style dangerouslySetInnerHTML={{__html: [
      "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');",
      "* { box-sizing: border-box; }",
      "::-webkit-scrollbar { width: 3px; }",
      "::-webkit-scrollbar-thumb { background: #d0cfc8; border-radius: 3px; }",
      "html, body, #root { height: 100%; margin: 0; }",
      "@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }"
    ].join("\n") }} />
  );
}
