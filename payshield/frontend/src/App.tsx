import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import {
  createTransaction,
  getTransactions,
  getTransactionCount,
} from "./services/api";

import { Transaction } from "./types/transaction";

function App() {
  // ==================================================
  // STATE
  // ==================================================

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionCount, setTransactionCount] = useState(0);

  const [form, setForm] = useState<Transaction>({
    transactionId: `TXN${Date.now()}`,
    step: 1,
    type: "TRANSFER",
    amount: 500000,
    oldBalanceOrg: 500000,
    newBalanceOrg: 0,
    oldBalanceDest: 0,
    newBalanceDest: 500000,
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Transaction monitoring filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Selected transaction for details modal
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // ==================================================
  // LOAD DASHBOARD DATA
  // ==================================================

  const loadDashboardData = async () => {
    try {
      const [transactionData, count] = await Promise.all([
        getTransactions(),
        getTransactionCount(),
      ]);

      setTransactions(transactionData);
      setTransactionCount(count);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ==================================================
  // FORM HANDLING
  // ==================================================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "amount" ||
        name === "oldBalanceOrg" ||
        name === "newBalanceOrg" ||
        name === "oldBalanceDest" ||
        name === "newBalanceDest" ||
        name === "step"
          ? Number(value)
          : value,
    }));
  };

  // ==================================================
  // RISK LEVEL
  // ==================================================

  const getRiskLevel = (riskScore: number = 0) => {
    if (riskScore >= 70) {
      return "Fraud";
    }

    if (riskScore >= 30) {
      return "Medium Risk";
    }

    return "Safe";
  };

  // ==================================================
  // SUBMIT TRANSACTION
  // ==================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const result = await createTransaction(form);

      const riskScore = result.riskScore ?? 0;
      const riskLevel = getRiskLevel(riskScore);

      if (riskLevel === "Fraud") {
        setMessage(
          `⚠️ FRAUD DETECTED — Risk Score: ${riskScore}%`
        );
      } else if (riskLevel === "Medium Risk") {
        setMessage(
          `⚠️ MEDIUM RISK — Risk Score: ${riskScore}%`
        );
      } else {
        setMessage(
          `✅ Transaction approved — Risk Score: ${riskScore}%`
        );
      }

      await loadDashboardData();

      setForm({
        transactionId: `TXN${Date.now()}`,
        step: 1,
        type: "TRANSFER",
        amount: 500000,
        oldBalanceOrg: 500000,
        newBalanceOrg: 0,
        oldBalanceDest: 0,
        newBalanceDest: 500000,
      });
    } catch (error) {
      console.error("Transaction failed:", error);

      setMessage(
        "❌ Transaction failed. Make sure the backend and fraud service are running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // DASHBOARD STATISTICS
  // ==================================================

  const fraudTransactions = transactions.filter(
    (transaction) => (transaction.riskScore ?? 0) >= 70
  ).length;

  const mediumRiskTransactions = transactions.filter(
    (transaction) => {
      const score = transaction.riskScore ?? 0;

      return score >= 30 && score < 70;
    }
  ).length;

  const safeTransactions = transactions.filter(
    (transaction) => (transaction.riskScore ?? 0) < 30
  ).length;

  // ==================================================
  // CHART DATA
  // ==================================================

  const riskData = [
    {
      name: "Safe",
      value: safeTransactions,
    },
    {
      name: "Medium Risk",
      value: mediumRiskTransactions,
    },
    {
      name: "Fraud",
      value: fraudTransactions,
    },
  ];

  const statusData = [
    {
      name: "Transactions",
      Safe: safeTransactions,
      "Medium Risk": mediumRiskTransactions,
      Fraud: fraudTransactions,
    },
  ];

  const chartColors = [
    "#22c55e",
    "#eab308",
    "#ef4444",
  ];

  // ==================================================
  // TRANSACTION MONITORING FILTER
  // ==================================================

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const riskScore =
        transaction.riskScore ?? 0;

      const riskLevel =
        getRiskLevel(riskScore);

      const matchesSearch =
        transaction.transactionId
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        riskLevel === statusFilter;

      const matchesType =
        typeFilter === "All" ||
        transaction.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    }
  );

  // ==================================================
  // RISK INDICATORS
  // ==================================================

  const getRiskIndicators = (
    transaction: Transaction
  ) => {
    const indicators: string[] = [];

    const riskScore =
      transaction.riskScore ?? 0;

    // High amount
    if (transaction.amount >= 500000) {
      indicators.push(
        "High transaction amount"
      );
    }

    // Large origin balance reduction
    if (
      transaction.oldBalanceOrg > 0 &&
      transaction.newBalanceOrg <
        transaction.oldBalanceOrg
    ) {
      indicators.push(
        "Significant origin balance change"
      );
    }

    // Transfer / cash out
    if (
      transaction.type === "TRANSFER" ||
      transaction.type === "CASH_OUT"
    ) {
      indicators.push(
        `${transaction.type} transaction requires additional monitoring`
      );
    }

    // Destination balance change
    if (
      transaction.oldBalanceDest !==
        transaction.newBalanceDest &&
      transaction.newBalanceDest > 0
    ) {
      indicators.push(
        "Destination balance changed"
      );
    }

    // High risk score
    if (riskScore >= 70) {
      indicators.push(
        "High model risk score"
      );
    } else if (riskScore >= 30) {
      indicators.push(
        "Moderate model risk score"
      );
    }

    // Fallback
    if (indicators.length === 0) {
      indicators.push(
        "No major transaction-level risk indicators detected"
      );
    }

    return indicators;
  };

  // ==================================================
  // RECOMMENDED ACTION
  // ==================================================

  const getRecommendedAction = (
    riskScore: number
  ) => {
    if (riskScore >= 70) {
      return "Block or hold the transaction for manual review.";
    }

    if (riskScore >= 30) {
      return "Flag the transaction for additional verification.";
    }

    return "Allow the transaction while continuing normal monitoring.";
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#f8fafc",
        padding: "30px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "34px",
              fontWeight: 800,
            }}
          >
            🛡️ PayShield
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "8px",
              fontSize: "16px",
            }}
          >
            Real-Time Fraud Detection & Transaction Monitoring
          </p>
        </div>

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >

          {/* TOTAL */}

          <div style={cardStyle}>
            <p style={labelStyle}>
              Total Transactions
            </p>

            <h2 style={numberStyle}>
              {transactionCount}
            </h2>
          </div>

          {/* SAFE */}

          <div
            style={{
              ...cardStyle,
              border: "1px solid #14532d",
            }}
          >
            <p
              style={{
                ...labelStyle,
                color: "#86efac",
              }}
            >
              Safe Transactions
            </p>

            <h2
              style={{
                ...numberStyle,
                color: "#22c55e",
              }}
            >
              {safeTransactions}
            </h2>
          </div>

          {/* MEDIUM */}

          <div
            style={{
              ...cardStyle,
              border: "1px solid #713f12",
            }}
          >
            <p
              style={{
                ...labelStyle,
                color: "#fde047",
              }}
            >
              Medium Risk
            </p>

            <h2
              style={{
                ...numberStyle,
                color: "#eab308",
              }}
            >
              {mediumRiskTransactions}
            </h2>
          </div>

          {/* FRAUD */}

          <div
            style={{
              ...cardStyle,
              border: "1px solid #7f1d1d",
            }}
          >
            <p
              style={{
                ...labelStyle,
                color: "#fca5a5",
              }}
            >
              Fraud Detected
            </p>

            <h2
              style={{
                ...numberStyle,
                color: "#ef4444",
              }}
            >
              {fraudTransactions}
            </h2>
          </div>
        </div>

        {/* ==================================================
            TRANSACTION FORM
        ================================================== */}

        <div
          style={{
            ...sectionStyle,
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
            }}
          >
            🔍 Analyze New Transaction
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >

              <div>
                <label>
                  Transaction ID
                </label>

                <input
                  type="text"
                  name="transactionId"
                  value={form.transactionId}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Step
                </label>

                <input
                  type="number"
                  name="step"
                  value={form.step}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Transaction Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="TRANSFER">
                    TRANSFER
                  </option>

                  <option value="CASH_OUT">
                    CASH_OUT
                  </option>

                  <option value="PAYMENT">
                    PAYMENT
                  </option>

                  <option value="CASH_IN">
                    CASH_IN
                  </option>

                  <option value="DEBIT">
                    DEBIT
                  </option>
                </select>
              </div>

              <div>
                <label>
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Old Balance Origin
                </label>

                <input
                  type="number"
                  name="oldBalanceOrg"
                  value={form.oldBalanceOrg}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  New Balance Origin
                </label>

                <input
                  type="number"
                  name="newBalanceOrg"
                  value={form.newBalanceOrg}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  Old Balance Destination
                </label>

                <input
                  type="number"
                  name="oldBalanceDest"
                  value={form.oldBalanceDest}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label>
                  New Balance Destination
                </label>

                <input
                  type="number"
                  name="newBalanceDest"
                  value={form.newBalanceDest}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "22px",
                padding: "13px 25px",
                borderRadius: "8px",
                border: "none",
                background: loading
                  ? "#475569"
                  : "#2563eb",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Transaction"}
            </button>
          </form>

          {message && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "8px",
                background: "#020617",
                border: "1px solid #334155",
                fontWeight: 700,
              }}
            >
              {message}
            </div>
          )}
        </div>

        {/* ==================================================
            ANALYTICS
        ================================================== */}

        <div
          style={{
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            📊 Dashboard Analytics
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(350px, 1fr))",
              gap: "20px",
            }}
          >

            {/* PIE CHART */}

            <div
              style={{
                ...sectionStyle,
                minHeight: "400px",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  textAlign: "center",
                }}
              >
                Risk Distribution
              </h3>

              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    label
                  >
                    {riskData.map(
                      (_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            chartColors[index]
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* BAR CHART */}

            <div
              style={{
                ...sectionStyle,
                minHeight: "400px",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  textAlign: "center",
                }}
              >
                Transaction Status
              </h3>

              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <BarChart data={statusData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#94a3b8"
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="Safe"
                    fill="#22c55e"
                  />

                  <Bar
                    dataKey="Medium Risk"
                    fill="#eab308"
                  />

                  <Bar
                    dataKey="Fraud"
                    fill="#ef4444"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ==================================================
            TRANSACTION MONITORING
        ================================================== */}

        <div
          style={{
            ...sectionStyle,
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                🔎 Transaction Monitoring
              </h2>

              <p
                style={{
                  color: "#94a3b8",
                  marginTop: "6px",
                  marginBottom: 0,
                }}
              >
                Search and filter analyzed transactions
              </p>
            </div>

            <button
              onClick={loadDashboardData}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid #334155",
                background: "#1e293b",
                color: "#f8fafc",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              🔄 Refresh
            </button>
          </div>

          {/* FILTERS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "15px",
              marginBottom: "25px",
            }}
          >

            {/* SEARCH */}

            <div>
              <label>
                Search Transaction ID
              </label>

              <input
                type="text"
                placeholder="e.g. TXN10003"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
                style={inputStyle}
              />
            </div>

            {/* STATUS */}

            <div>
              <label>
                Risk Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Safe">
                  Safe
                </option>

                <option value="Medium Risk">
                  Medium Risk
                </option>

                <option value="Fraud">
                  Fraud
                </option>
              </select>
            </div>

            {/* TYPE */}

            <div>
              <label>
                Transaction Type
              </label>

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="All">
                  All Types
                </option>

                <option value="TRANSFER">
                  TRANSFER
                </option>

                <option value="CASH_OUT">
                  CASH_OUT
                </option>

                <option value="PAYMENT">
                  PAYMENT
                </option>

                <option value="CASH_IN">
                  CASH_IN
                </option>

                <option value="DEBIT">
                  DEBIT
                </option>
              </select>
            </div>
          </div>

          {/* FILTER RESULT */}

          <div
            style={{
              marginBottom: "15px",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Showing{" "}
            <strong
              style={{
                color: "#f8fafc",
              }}
            >
              {filteredTransactions.length}
            </strong>{" "}
            of{" "}
            <strong
              style={{
                color: "#f8fafc",
              }}
            >
              {transactions.length}
            </strong>{" "}
            transactions
          </div>

          {/* TABLE */}

          {filteredTransactions.length === 0 ? (
            <div
              style={{
                padding: "35px",
                textAlign: "center",
                color: "#94a3b8",
                border: "1px dashed #334155",
                borderRadius: "10px",
              }}
            >
              🔍 No transactions match your filters.
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "950px",
                }}
              >
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Transaction ID
                    </th>

                    <th style={thStyle}>
                      Type
                    </th>

                    <th style={thStyle}>
                      Amount
                    </th>

                    <th style={thStyle}>
                      Risk Score
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTransactions.map(
                    (transaction) => {
                      const riskScore =
                        transaction.riskScore ?? 0;

                      const riskLevel =
                        getRiskLevel(
                          riskScore
                        );

                      return (
                        <tr
                          key={
                            transaction.id ??
                            transaction.transactionId
                          }
                        >
                          <td style={tdStyle}>
                            {
                              transaction.transactionId
                            }
                          </td>

                          <td style={tdStyle}>
                            {transaction.type}
                          </td>

                          <td style={tdStyle}>
                            ₹
                            {transaction.amount.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td
                            style={{
                              ...tdStyle,
                              fontWeight: 700,
                            }}
                          >
                            {riskScore}%
                          </td>

                          <td style={tdStyle}>

                            {riskLevel ===
                              "Fraud" && (
                              <span
                                style={{
                                  background:
                                    "#7f1d1d",
                                  color:
                                    "#fca5a5",
                                  padding:
                                    "5px 10px",
                                  borderRadius:
                                    "999px",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                ⚠️ Fraud
                              </span>
                            )}

                            {riskLevel ===
                              "Medium Risk" && (
                              <span
                                style={{
                                  background:
                                    "#713f12",
                                  color:
                                    "#fde047",
                                  padding:
                                    "5px 10px",
                                  borderRadius:
                                    "999px",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                ⚠️ Medium Risk
                              </span>
                            )}

                            {riskLevel ===
                              "Safe" && (
                              <span
                                style={{
                                  background:
                                    "#14532d",
                                  color:
                                    "#86efac",
                                  padding:
                                    "5px 10px",
                                  borderRadius:
                                    "999px",
                                  fontSize:
                                    "12px",
                                  fontWeight:
                                    700,
                                }}
                              >
                                ✅ Safe
                              </span>
                            )}
                          </td>

                          {/* VIEW DETAILS */}

                          <td style={tdStyle}>
                            <button
                              onClick={() =>
                                setSelectedTransaction(
                                  transaction
                                )
                              }
                              style={{
                                padding:
                                  "8px 13px",
                                borderRadius:
                                  "7px",
                                border:
                                  "1px solid #334155",
                                background:
                                  "#1e293b",
                                color:
                                  "#f8fafc",
                                cursor:
                                  "pointer",
                                fontWeight:
                                  600,
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ==================================================
            FRAUD DETAILS MODAL
        ================================================== */}

        {selectedTransaction && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(0, 0, 0, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
            onClick={() =>
              setSelectedTransaction(null)
            }
          >
            <div
              style={{
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                background: "#0f172a",
                border:
                  "1px solid #334155",
                borderRadius: "16px",
                padding: "28px",
                boxShadow:
                  "0 25px 60px rgba(0,0,0,0.5)",
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  ⚠️ Transaction Details
                </h2>

                <button
                  onClick={() =>
                    setSelectedTransaction(
                      null
                    )
                  }
                  style={{
                    background:
                      "transparent",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              {/* RISK SUMMARY */}

              <div
                style={{
                  background: "#020617",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, 1fr)",
                    gap: "18px",
                  }}
                >

                  <div>
                    <p
                      style={modalLabelStyle}
                    >
                      Transaction ID
                    </p>

                    <strong>
                      {
                        selectedTransaction.transactionId
                      }
                    </strong>
                  </div>

                  <div>
                    <p
                      style={modalLabelStyle}
                    >
                      Transaction Type
                    </p>

                    <strong>
                      {
                        selectedTransaction.type
                      }
                    </strong>
                  </div>

                  <div>
                    <p
                      style={modalLabelStyle}
                    >
                      Transaction Amount
                    </p>

                    <strong>
                      ₹
                      {selectedTransaction.amount.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div>
                    <p
                      style={modalLabelStyle}
                    >
                      Risk Score
                    </p>

                    <strong
                      style={{
                        fontSize: "20px",
                        color:
                          getRiskLevel(
                            selectedTransaction.riskScore ??
                              0
                          ) === "Fraud"
                            ? "#ef4444"
                            : getRiskLevel(
                                selectedTransaction.riskScore ??
                                  0
                              ) ===
                              "Medium Risk"
                            ? "#eab308"
                            : "#22c55e",
                      }}
                    >
                      {selectedTransaction.riskScore ??
                        0}
                      %
                    </strong>
                  </div>
                </div>
              </div>

              {/* RISK LEVEL */}

              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <p
                  style={{
                    ...modalLabelStyle,
                    marginBottom: "8px",
                  }}
                >
                  Risk Level
                </p>

                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 15px",
                    borderRadius: "999px",
                    background:
                      getRiskLevel(
                        selectedTransaction.riskScore ??
                          0
                      ) === "Fraud"
                        ? "#7f1d1d"
                        : getRiskLevel(
                            selectedTransaction.riskScore ??
                              0
                          ) === "Medium Risk"
                        ? "#713f12"
                        : "#14532d",
                    color:
                      getRiskLevel(
                        selectedTransaction.riskScore ??
                          0
                      ) === "Fraud"
                        ? "#fca5a5"
                        : getRiskLevel(
                            selectedTransaction.riskScore ??
                              0
                          ) === "Medium Risk"
                        ? "#fde047"
                        : "#86efac",
                    fontWeight: 700,
                  }}
                >
                  {getRiskLevel(
                    selectedTransaction.riskScore ??
                      0
                  )}
                </div>
              </div>

              {/* RISK INDICATORS */}

              <div
                style={{
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "12px",
                  }}
                >
                  🔍 Risk Indicators
                </h3>

                <div
                  style={{
                    background: "#020617",
                    borderRadius: "10px",
                    padding: "15px",
                  }}
                >
                  {getRiskIndicators(
                    selectedTransaction
                  ).map(
                    (indicator, index) => (
                      <div
                        key={index}
                        style={{
                          padding:
                            "8px 0",
                          borderBottom:
                            index <
                            getRiskIndicators(
                              selectedTransaction
                            ).length -
                              1
                              ? "1px solid #1e293b"
                              : "none",
                          color:
                            "#cbd5e1",
                        }}
                      >
                        • {indicator}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* RECOMMENDED ACTION */}

              <div>
                <h3
                  style={{
                    marginBottom: "12px",
                  }}
                >
                  🛡️ Recommended Action
                </h3>

                <div
                  style={{
                    background:
                      getRiskLevel(
                        selectedTransaction.riskScore ??
                          0
                      ) === "Fraud"
                        ? "#450a0a"
                        : getRiskLevel(
                            selectedTransaction.riskScore ??
                              0
                          ) === "Medium Risk"
                        ? "#422006"
                        : "#052e16",
                    borderRadius: "10px",
                    padding: "16px",
                    color: "#e2e8f0",
                  }}
                >
                  {getRecommendedAction(
                    selectedTransaction.riskScore ??
                      0
                  )}
                </div>
              </div>

              {/* DISCLAIMER */}

              <p
                style={{
                  marginTop: "20px",
                  color: "#64748b",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                Note: The indicators shown here
                are transaction-level risk signals
                derived from the available transaction
                fields. They are not presented as the
                exact internal explanation of the
                machine-learning model.
              </p>

              {/* CLOSE */}

              <button
                onClick={() =>
                  setSelectedTransaction(
                    null
                  )
                }
                style={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div
          style={{
            textAlign: "center",
            padding: "20px",
            color: "#64748b",
            fontSize: "13px",
          }}
        >
          PayShield — AI-Powered Fraud Detection System
        </div>
      </div>
    </div>
  );
}

// ==================================================
// STYLES
// ==================================================

const cardStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "22px",
};

const sectionStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "25px",
};

const labelStyle: React.CSSProperties = {
  margin: 0,
  color: "#94a3b8",
  fontSize: "14px",
};

const numberStyle: React.CSSProperties = {
  fontSize: "30px",
  margin: "10px 0 0",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "7px",
  padding: "11px 12px",
  borderRadius: "7px",
  border: "1px solid #334155",
  background: "#020617",
  color: "#f8fafc",
  outline: "none",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "13px",
  borderBottom: "1px solid #334155",
  color: "#94a3b8",
  fontSize: "13px",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 13px",
  borderBottom: "1px solid #1e293b",
  fontSize: "14px",
};

const modalLabelStyle: React.CSSProperties = {
  margin: "0 0 5px",
  color: "#64748b",
  fontSize: "12px",
};

export default App;