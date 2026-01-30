import { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale);

const API_BASE = "http://localhost:5093";

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#1e1e1e", color: "#e5e5e5", padding: "30px", fontFamily: "Segoe UI, Arial, sans-serif" },
  card: { backgroundColor: "#2a2a2a", padding: "20px", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 4px 10px rgba(0,0,0,0.4)" },
  input: { backgroundColor: "#3a3a3a", color: "#ffffff", border: "1px solid #555", borderRadius: "5px", padding: "8px", width: "140px" },
  button: { backgroundColor: "#555", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "5px", cursor: "pointer", marginRight: "10px" },
  tabActive: { backgroundColor: "#007bff", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer", marginRight: "10px" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  th: { backgroundColor: "#3a3a3a", padding: "8px", border: "1px solid #555" },
  td: { padding: "8px", border: "1px solid #555", textAlign: "center" }
};

function App() {
  const [activeMode, setActiveMode] = useState("calc");

  // 🔹 Calculator States
  const [form, setForm] = useState({ amplitude: "", omega: "", phase: "", time: "" });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 AI Analysis Mode States
  const [observations, setObservations] = useState([{ t: "0.0", y: "0.0" }]);
  const [aiResult, setAiResult] = useState("");
  const [analyzing, setAnalyzing] = useState(false); // Isolated state for AI button

  const loadData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sine/all`);
      setData(await res.json());
    } catch { setError("Failed to load data"); }
  };

  useEffect(() => { loadData(); }, []);

  // --- AI Analysis Logic ---
  const addRow = () => setObservations([...observations, { t: "", y: "" }]);
  const removeRow = (index) => setObservations(observations.filter((_, i) => i !== index));
  const updateObs = (index, field, val) => {
    const next = [...observations];
    next[index][field] = val;
    setObservations(next);
  };

  const analyzeWithAI = async () => {
    setAnalyzing(true);
    try {
        const res = await fetch(`${API_BASE}/api/sine/analyze-relationship`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ observations })
        });

        const text = await res.text();
        let cleanText = text;

        if (text.includes("FINAL_RESULT:")) {
            cleanText = text.split("FINAL_RESULT:")[1];
        }

        setAiResult(cleanText.replace(/[*]/g, "").trim());
    } catch (err) {
        setAiResult("Analysis failed.");
    } finally {
        setAnalyzing(false);
    }
  };

  // --- Calculator Logic ---
  const calculate = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/api/sine/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amplitude: Number(form.amplitude),
          omega: Number(form.omega),
          phase: Number(form.phase),
          time: Number(form.time)
        })
      });
      loadData();
    } catch { setError("Calculation failed"); }
    finally { setLoading(false); }
  };

  const waveData = useMemo(() => {
    const A = Number(form.amplitude);
    const omega = Number(form.omega);
    const phi = Number(form.phase);
    if (!A || !omega) return null;
    const labels = [];
    const points = [];
    for (let t = 0; t <= 10; t += 0.1) {
      labels.push(t.toFixed(1));
      points.push(A * Math.sin(omega * t + phi));
    }
    return {
      labels,
      datasets: [{ label: "Sine Wave", data: points, borderColor: "#9ca3af", borderWidth: 2, tension: 0.4, pointRadius: 0 }]
    };
  }, [form.amplitude, form.omega, form.phase]);

  return (
    <div style={styles.page}>
      <h2>Sine Wave Evaluator</h2>
      
      <div style={{ marginBottom: "20px" }}>
        <button 
          style={activeMode === "calc" ? styles.tabActive : styles.button} 
          onClick={() => setActiveMode("calc")}
        >
          Direct Calculation Mode
        </button>
        <button 
          style={activeMode === "ai" ? styles.tabActive : styles.button} 
          onClick={() => setActiveMode("ai")}
        >
          ✨ AI Analysis Mode
        </button>
      </div>

      {activeMode === "calc" ? (
        <>
          <div style={styles.card}>
            <h3>Input Parameters</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {["amplitude", "omega", "phase", "time"].map(k => (
                <input key={k} style={styles.input} placeholder={k} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
              ))}
            </div>
            <br />
            <button style={styles.button} onClick={calculate} disabled={loading}>{loading ? "Calculating..." : "Calculate"}</button>
          </div>

          <div style={styles.card}>
            <h3>Wave Creator</h3>
            {waveData ? <Line data={waveData} /> : <p>Enter parameters to see the wave</p>}
          </div>

          <div style={styles.card}>
            <h3>Previous Calculations</h3>
            <table style={styles.table}>
              <thead><tr>{["A", "ω", "φ", "t", "y"].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
              <tbody>{data.map(row => (
                <tr key={row.id}>
                  <td style={styles.td}>{row.amplitude}</td>
                  <td style={styles.td}>{row.omega}</td>
                  <td style={styles.td}>{row.phase}</td>
                  <td style={styles.td}>{row.time}</td>
                  <td style={styles.td}>{row.yValue}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      ) : (
        <div style={styles.card}>
          <h3>✨ AI Analysis: Observed Data Points</h3>
          <p>Enter multiple (t, y) pairs for the AI to extract parameters (A, ω, φ).</p>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>t (Independent)</th>
                <th style={styles.th}>y (Dependent)</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((obs, i) => (
                <tr key={i}>
                  <td style={styles.td}><input style={styles.input} value={obs.t} onChange={(e) => updateObs(i, 't', e.target.value)} placeholder="e.g. 0.5" /></td>
                  <td style={styles.td}><input style={styles.input} value={obs.y} onChange={(e) => updateObs(i, 'y', e.target.value)} placeholder="e.g. 0.84" /></td>
                  <td style={styles.td}><button style={{...styles.button, backgroundColor: "#882222"}} onClick={() => removeRow(i)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <button style={styles.button} onClick={addRow}>+ Add Row</button>
          <button style={{...styles.button, backgroundColor: "#28a745"}} onClick={analyzeWithAI} disabled={analyzing}>
             {analyzing ? "Analyzing..." : "Analyze Relationship with AI"}
          </button>

          {aiResult && (
            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#111", borderRadius: "5px", border: "1px solid #39ff14" }}>
              <h4 style={{ color: "#39ff14", marginTop: 0 }}>AI Predicted Parameters:</h4>
              <div style={{ fontFamily: "monospace", fontSize: "1.1rem" }}>{aiResult}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;