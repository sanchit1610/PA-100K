import { useRef, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

const MODEL_METRICS = [
  ["Macro F1", "40.94%"],
  ["Micro F1", "64.06%"],
  ["Macro Precision", "62.36%"],
  ["Macro Recall", "36.78%"],
  ["Balanced Accuracy", "63.31%"],
  ["Mean PR-AUC", "53.07%"],
];

const ATTRIBUTE_F1 = [
  ["Trousers", 90.8],
  ["Long Sleeve", 77.1],
  ["Short Sleeve", 74.4],
  ["Female", 65.9],
  ["Back", 64.9],
  ["Front", 63.1],
  ["Side", 59.8],
  ["Shorts", 43.7],
  ["Upper Logo", 25.7],
  ["Glasses", 25.1],
  ["Skirt / Dress", 24.7],
  ["Shoulder Bag", 15.2],
  ["Hat", 10.7],
  ["Hand Bag", 8.1],
  ["Backpack", 3.9],
  ["Upper Plaid", 1.9],
];

function App() {
  const [activePage, setActivePage] = useState("prediction");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const fileInputRef = useRef(null);

  const selectFile = (file) => {
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPG or PNG image.");
      return;
    }

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setShowRaw(false);
    setError("");
  };

  const handlePredict = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError("");
    setShowRaw(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="app">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      {activePage === "prediction" ? (
        <PredictionPage
          selectedFile={selectedFile}
          preview={preview}
          result={result}
          loading={loading}
          error={error}
          dragging={dragging}
          setDragging={setDragging}
          selectFile={selectFile}
          handlePredict={handlePredict}
          reset={reset}
          fileInputRef={fileInputRef}
          showRaw={showRaw}
          setShowRaw={setShowRaw}
        />
      ) : (
        <InsightsPage />
      )}
    </div>
  );
}

function Navbar({ activePage, setActivePage }) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="brand">
          <div className="brand-icon">P</div>

          <div>
            <strong>PAR Vision</strong>
            <span>Pedestrian Intelligence</span>
          </div>
        </div>

        <div className="nav-links">
          <button
            className={activePage === "prediction" ? "active" : ""}
            onClick={() => setActivePage("prediction")}
          >
            Prediction
          </button>

          <button
            className={activePage === "insights" ? "active" : ""}
            onClick={() => setActivePage("insights")}
          >
            Model Insights
          </button>
        </div>

        <div className="online-pill">
          <span />
          Model Online
        </div>
      </div>
    </nav>
  );
}

function PredictionPage(props) {
  const {
    selectedFile,
    preview,
    result,
    loading,
    error,
    dragging,
    setDragging,
    selectFile,
    handlePredict,
    reset,
    fileInputRef,
    showRaw,
    setShowRaw,
  } = props;

  return (
    <main className="main">
      <section className="hero">
        <span className="hero-tag">AI-POWERED COMPUTER VISION</span>

        <h1>
          Pedestrian Attribute
          <span> Recognition</span>
        </h1>

        <p>
          A lightweight multi-label deep learning system for recognizing
          pedestrian appearance and clothing attributes from images.
        </p>

        <div className="hero-chips">
          <span>MobileNetV2</span>
          <span>PA-100K</span>
          <span>16 Attributes</span>
          <span>224 × 224 RGB</span>
        </div>
      </section>

      <section className="workspace">
        <div className="glass-card image-card">
          <CardHeader
            kicker="INPUT"
            title="Pedestrian Image"
            action={selectedFile ? "Reset" : null}
            onAction={reset}
          />

          {!preview ? (
            <div
              className={`drop-zone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                selectFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                hidden
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => selectFile(e.target.files?.[0])}
              />

              <div className="upload-symbol">↑</div>
              <h3>Upload pedestrian image</h3>
              <p>Drag and drop or click to browse</p>
              <small>JPG / PNG</small>
            </div>
          ) : (
            <>
              <div className="image-preview">
                <img src={preview} alt="Pedestrian" />
                <div className="filename">{selectedFile?.name}</div>
              </div>

              <button
                className="primary-button"
                onClick={handlePredict}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Pedestrian →"}
              </button>
            </>
          )}

          {error && <div className="error">{error}</div>}
        </div>

        <div className="glass-card output-card">
          <CardHeader
            kicker="OUTPUT"
            title="Recognition Results"
            badge={result ? "Prediction Complete" : null}
          />

          {!result && !loading && <EmptyState />}

          {loading && <LoadingState />}

          {result && !loading && (
            <Results
              result={result}
              showRaw={showRaw}
              setShowRaw={setShowRaw}
            />
          )}
        </div>
      </section>

      {result && (
        <>
          <GroupedProbabilities result={result} />
          <ResearchNotice />
        </>
      )}

      <ModelPipeline />

      <footer>
        PAR Vision · Pedestrian Attribute Recognition Research Prototype
      </footer>
    </main>
  );
}

function Results({ result, showRaw, setShowRaw }) {
  const cards = [
    ["Gender", result.gender.label, result.gender.confidence],
    [
      "Orientation",
      result.orientation.label,
      result.orientation.confidence,
    ],
    ["Sleeve", formatName(result.sleeve.label), result.sleeve.confidence],
    [
      "Lower Clothing",
      formatName(result.lower_clothing.label),
      result.lower_clothing.confidence,
    ],
  ];

  return (
    <>
      <div className="prediction-grid">
        {cards.map(([title, label, confidence]) => (
          <PredictionCard
            key={title}
            title={title}
            label={label}
            confidence={confidence}
          />
        ))}
      </div>

      <div className="section-divider" />

      <div className="section-title">
        <div>
          <h3>Additional Attributes</h3>
          <p>Independent sigmoid confidence scores</p>
        </div>
      </div>

      <div className="attribute-list">
        {Object.entries(result.attributes).map(([name, value]) => (
          <ConfidenceBar key={name} name={formatName(name)} value={value} />
        ))}
      </div>

      <button
        className="raw-button"
        onClick={() => setShowRaw((prev) => !prev)}
      >
        {showRaw ? "Hide raw model probabilities" : "View raw model probabilities"}
        <span>{showRaw ? "↑" : "↓"}</span>
      </button>

      {showRaw && (
        <div className="raw-grid">
          {Object.entries(result.raw_predictions).map(([name, value]) => (
            <div className="raw-cell" key={name}>
              <span>{formatName(name)}</span>
              <strong>{(value * 100).toFixed(2)}%</strong>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PredictionCard({ title, label, confidence }) {
  const value = confidence * 100;

  return (
    <div className="prediction-card">
      <div className="prediction-top">
        <span className="prediction-icon">{title[0]}</span>
        <span className="confidence-badge">{value.toFixed(1)}%</span>
      </div>

      <small>{title}</small>
      <strong>{label}</strong>

      <div className="mini-track">
        <div style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function GroupedProbabilities({ result }) {
  const raw = result.raw_predictions;

  const groups = [
    {
      title: "Orientation Distribution",
      subtitle: "Independent outputs for mutually exclusive orientation labels",
      items: [
        ["Front", raw.Front],
        ["Side", raw.Side],
        ["Back", raw.Back],
      ],
    },
    {
      title: "Sleeve Distribution",
      subtitle: "Short sleeve vs long sleeve predictions",
      items: [
        ["Short Sleeve", raw.ShortSleeve],
        ["Long Sleeve", raw.LongSleeve],
      ],
    },
    {
      title: "Lower Clothing Distribution",
      subtitle: "Predicted lower-body clothing probabilities",
      items: [
        ["Trousers", raw.Trousers],
        ["Shorts", raw.Shorts],
        ["Skirt / Dress", raw["Skirt&Dress"]],
      ],
    },
  ];

  return (
    <section className="analysis-section">
      <div className="section-heading">
        <div>
          <span>MODEL INTERPRETATION</span>
          <h2>Grouped Attribute Probabilities</h2>
        </div>

        <p>
          These labels were trained using independent sigmoid outputs and
          therefore do not necessarily sum to 100%.
        </p>
      </div>

      <div className="group-grid">
        {groups.map((group) => (
          <div className="glass-card group-card" key={group.title}>
            <h3>{group.title}</h3>
            <p>{group.subtitle}</p>

            {group.items.map(([label, value]) => (
              <ConfidenceBar key={label} name={label} value={value} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function ConfidenceBar({ name, value }) {
  const percentage = value * 100;

  return (
    <div className="confidence-row">
      <div>
        <span>{name}</span>
        <strong>{percentage.toFixed(1)}%</strong>
      </div>

      <div className="confidence-track">
        <div style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ResearchNotice() {
  return (
    <section className="research-callout">
      <div className="callout-icon">!</div>

      <div>
        <span>BASELINE MODEL NOTE</span>

        <h3>Minority attributes may be under-detected</h3>

        <p>
          The current baseline uses Binary Cross-Entropy. Evaluation on
          PA-100K shows strong performance on frequent classes such as
          Trousers, while rare attributes such as Hat, Backpack and
          Upper Plaid suffer from low recall. This motivates the
          imbalance-aware experiments in this project.
        </p>
      </div>
    </section>
  );
}

function ModelPipeline() {
  const steps = [
    ["01", "Input Image", "RGB pedestrian image"],
    ["02", "Preprocessing", "Resize to 224 × 224"],
    ["03", "MobileNetV2", "Feature extraction"],
    ["04", "Classifier", "16 sigmoid outputs"],
    ["05", "Interpretation", "Structured attributes"],
  ];

  return (
    <section className="pipeline-section">
      <div className="section-heading">
        <div>
          <span>SYSTEM ARCHITECTURE</span>
          <h2>Inference Pipeline</h2>
        </div>
      </div>

      <div className="pipeline">
        {steps.map(([number, title, subtitle], index) => (
          <div className="pipeline-wrap" key={title}>
            <div className="pipeline-card">
              <span>{number}</span>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </div>

            {index !== steps.length - 1 && (
              <div className="pipeline-arrow">→</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function InsightsPage() {
  return (
    <main className="main insights-page">
      <section className="insights-hero">
        <span className="hero-tag">MODEL EVALUATION</span>
        <h1>Research & Model Insights</h1>

        <p>
          Experimental performance of the MobileNetV2 + Binary
          Cross-Entropy baseline on the PA-100K test split.
        </p>
      </section>

      <section className="metrics-grid">
        {MODEL_METRICS.map(([label, value]) => (
          <div className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="insight-layout">
        <div className="glass-card performance-panel">
          <CardHeader
            kicker="ATTRIBUTE ANALYSIS"
            title="Per-Attribute F1 Score"
          />

          <div className="f1-list">
            {ATTRIBUTE_F1.map(([name, value]) => (
              <div className="f1-row" key={name}>
                <div>
                  <span>{name}</span>
                  <strong>{value.toFixed(1)}%</strong>
                </div>

                <div className="f1-track">
                  <div style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-side">
          <div className="glass-card insight-box">
            <span className="box-label">KEY FINDING</span>

            <h3>High accuracy does not guarantee good minority detection.</h3>

            <p>
              Hat achieved very high classification accuracy while its
              recall remained extremely low. This illustrates the class
              imbalance problem in pedestrian attribute recognition.
            </p>
          </div>

          <div className="glass-card insight-box">
            <span className="box-label">RESEARCH DIRECTION</span>

            <h3>Imbalance-aware loss comparison</h3>

            <p>
              The next experiments compare BCE against Weighted BCE,
              Focal Loss and Asymmetric Loss while keeping the dataset,
              architecture and training protocol fixed.
            </p>

            <div className="experiment-list">
              <span className="complete-exp">✓ BCE Baseline</span>
              <span>○ Weighted BCE</span>
              <span>○ Focal Loss</span>
              <span>○ Asymmetric Loss</span>
            </div>
          </div>

          <div className="glass-card insight-box">
            <span className="box-label">DATASET</span>
            <h3>PA-100K</h3>

            <div className="dataset-stats">
              <div>
                <strong>80K</strong>
                <span>Train</span>
              </div>

              <div>
                <strong>10K</strong>
                <span>Validation</span>
              </div>

              <div>
                <strong>10K</strong>
                <span>Test</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CardHeader({ kicker, title, action, onAction, badge }) {
  return (
    <div className="card-header">
      <div>
        <span>{kicker}</span>
        <h2>{title}</h2>
      </div>

      {action && (
        <button onClick={onAction} className="ghost-button">
          {action}
        </button>
      )}

      {badge && <div className="success-badge">{badge}</div>}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="scan-box">
        <div className="person-head" />
        <div className="person-body" />
        <div className="scan-line" />
      </div>

      <h3>Ready for analysis</h3>

      <p>
        Upload a pedestrian image to view visual attribute predictions.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="empty-state">
      <div className="loader" />
      <h3>Analyzing pedestrian...</h3>
      <p>Running MobileNetV2 inference and attribute classification.</p>
    </div>
  );
}

function formatName(name) {
  const names = {
    ShortSleeve: "Short Sleeve",
    LongSleeve: "Long Sleeve",
    HandBag: "Hand Bag",
    ShoulderBag: "Shoulder Bag",
    UpperLogo: "Upper Logo",
    UpperPlaid: "Upper Plaid",
    "Skirt&Dress": "Skirt / Dress",
  };

  return names[name] || name;
}

export default App;