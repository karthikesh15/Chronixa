import React, { useState } from 'react';
import axios from 'axios';
import {
  Activity, ShieldAlert, CheckCircle, ChevronRight, Info
} from 'lucide-react';
import { ReactTyped } from "react-typed";
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    age: 65, bmi: 27, mean_sbp: 130, hbA1c: 6.0, bnp: 150, med_count: 4
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    try {
      setLoading(true);
      const res = await axios.post('https://chronixa-ai.onrender.com/predict', {
        features: Object.fromEntries(
          Object.entries(formData).map(([k, v]) => [k, Number(v)])
        )
      });
      setResult(res.data);
    } catch (err) {
      alert("⚠️ Backend not running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1><Activity /> Chronixa</h1>
        <p>Next-Gen Predictive Health Intelligence</p>

        <ReactTyped
          strings={[
            "Analyzing Patient Data...",
            "Predicting Chronic Risk...",
            "Generating AI Insights..."
          ]}
          typeSpeed={50}
          backSpeed={30}
          loop
          className="typing"
        />
      </header>

      <div className="container">

        {/* INPUT CARD */}
        <div className="card">
          <h2>Enter Patient Data</h2>

          <div className="form">
            {Object.keys(formData).map((key) => (
              <div className="field" key={key}>
                <label>{key.replace('_', ' ')}</label>
                <input
                  type="number"
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>

          <button className="btn" onClick={handlePredict}>
            {loading ? "Processing..." : <>Analyze <ChevronRight size={18} /></>}
          </button>
        </div>

        {/* RESULT CARD */}
        <div className="card">
          {!result ? (
            <div className="empty">
              <Info size={40} />
              <p>Enter data to generate AI report</p>
            </div>
          ) : (
            <div className="result">
              <h2 className="ai-title">AI Risk Analysis</h2>

              <div className={`banner ${result.prediction ? 'danger' : 'safe'}`}>
                {result.prediction ? <ShieldAlert /> : <CheckCircle />}
                {result.prediction ? "HIGH RISK DETECTED" : "LOW RISK"}
              </div>

              <div className="stats">
                <div>
                  <p>Confidence</p>
                  <h3>{(result.probability * 100).toFixed(1)}%</h3>
                </div>
                <div>
                  <p>Status</p>
                  <h3>{result.prediction ? "Critical" : "Stable"}</h3>
                </div>
              </div>

              <div className="tips">
                <h4>Suggestions</h4>
                <ul>
                  {formData.mean_sbp > 140 && <li>⚠️ High BP detected</li>}
                  {formData.hbA1c > 7 && <li>⚠️ Diabetes risk</li>}
                  <li>📅 Follow-up within 2 weeks</li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;