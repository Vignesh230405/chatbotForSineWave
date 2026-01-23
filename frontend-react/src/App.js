import { useEffect, useState } from "react";

const API_BASE = "http://localhost:5093";

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#1e1e1e",
    color: "#e5e5e5",
    padding: "30px",
    fontFamily: "Segoe UI, Arial, sans-serif"
  },
  card: {
    backgroundColor: "#2a2a2a",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.4)"
  },
  input: {
    backgroundColor: "#3a3a3a",
    color: "#ffffff",
    border: "1px solid #555",
    borderRadius: "5px",
    padding: "8px",
    width: "140px"
  },
  button: {
    backgroundColor: "#555",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "5px",
    cursor: "pointer"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px"
  },
  th: {
    backgroundColor: "#3a3a3a",
    padding: "8px",
    border: "1px solid #555"
  },
  td: {
    padding: "8px",
    border: "1px solid #f9f4f4",
    textAlign: "center"
  }
};

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const [form, setForm] = useState({
    amplitude: "",
    omega: "",
    phase: "",
    time: ""
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sine/all`);
      setData(await res.json());
    } catch {
      setError("Failed to load data");
    }
  };

  const calculate = async () => {
    setLoading(true);
    setError("");

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

      setForm({ amplitude: "", omega: "", phase: "", time: "" });
      loadData();
    } catch {
      setError("Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const askGemini = async () => {
    if (!question.trim()) return;

    setAsking(true);
    setAnswer("");

    try {
      const res = await fetch(`${API_BASE}/api/sine/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      setAnswer(await res.text());
    } catch {
      setAnswer("Gemini request failed");
    } finally {
      setAsking(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div style={styles.page}>
      <h2>Sine Wave Calculator</h2>
      <p>y = A · sin(ωt + φ)</p>

      <div style={styles.card}>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {["amplitude", "omega", "phase", "time"].map(k => (
            <input
              key={k}
              style={styles.input}
              placeholder={k}
              value={form[k]}
              onChange={e => setForm({ ...form, [k]: e.target.value })}
            />
          ))}
        </div>

        <br />
        <button style={styles.button} onClick={calculate} disabled={loading}>
          {loading ? "Calculating..." : "Calculate"}
        </button>

        {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}
      </div>

      <div style={styles.card}>
        <h3>Previous Calculations</h3>

        {data.length === 0 ? (
          <p>No data yet</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["A", "ω", "φ", "t", "y"].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id}>
                  <td style={styles.td}>{row.amplitude}</td>
                  <td style={styles.td}>{row.omega}</td>
                  <td style={styles.td}>{row.phase}</td>
                  <td style={styles.td}>{row.time}</td>
                  <td style={styles.td}>{row.yValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={styles.card}>
        <h3>Ask About Last Calculation (Gemini)</h3>

        <input
          style={{ ...styles.input, width: "400px" }}
          placeholder="What is the omega value?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />

        <br /><br />

        <button style={styles.button} onClick={askGemini} disabled={asking}>
          {asking ? "Thinking..." : "Ask Gemini"}
        </button>

        {answer && (
          <div style={{ marginTop: "15px", background: "#1c1c1c", padding: "10px", borderRadius: "5px" }}>
            <b>Answer:</b>
            <p>{answer}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
