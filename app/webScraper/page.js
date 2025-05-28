// File: app/webScraper/page.jsx
"use client";

import React, { useState } from "react";
import styles from "./webScraper.module.css";

export default function WebScraperPage() {
  const [address, setAddress]       = useState("");
  const [radius, setRadius]         = useState(1000);
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [err, setErr]               = useState(null);

  // Folder save flow
  const [folderName, setFolderName] = useState("");
  const [saveMsg, setSaveMsg]       = useState("");

  // 1) Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const params = new URLSearchParams({ address, radius });
      const res    = await fetch(`/api/scrape?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  // 2) Save to DB under a folder, if the user enters one
  const handleSaveDb = async () => {
    if (!folderName.trim()) {
      alert("Please enter a folder name before saving.");
      return;
    }
    try {
      const res = await fetch("/api/save-db", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ folder: folderName.trim(), leads: results }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaveMsg(data.message);
      setFolderName("");
    } catch (e) {
      console.error(e);
      alert("Failed to save: " + e.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>CLOUDEX LEAD GENERATOR</h1>
      </header>

      <form className={styles.form} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Radius (m)"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {err && <p className={styles.error}>Error: {err}</p>}

      {/* If we have results, show the optional save flow */}
      {results.length > 0 && (
        <div className={styles.saveFolder}>
          <input
            type="text"
            placeholder="Enter folder name (optional)"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className={styles.saveinput}
          />
          <button onClick={handleSaveDb} className={styles.saveDbBtn}>
            Save to DB
          </button>
          {saveMsg && <p className={styles.saveMsg}>{saveMsg}</p>}
        </div>
      )}

      {/* Always render the live search results */}
      {results.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Website</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {results.map((b, i) => (
                <tr key={i}>
                  <td data-label="Name">{b.name}</td>
                  <td data-label="Phone">{b.phone || "-"}</td>
                  <td data-label="Website">
                    {b.website ? (
                      <a href={b.website} target="_blank" rel="noopener">
                        {b.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td data-label="Rating">
                    {b.rating != null ? b.rating.toFixed(1) : "-"}
                  </td>
                  <td data-label="Reviews">{b.reviews ?? "-"}</td>
                  <td data-label="Address">{b.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
