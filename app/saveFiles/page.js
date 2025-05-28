"use client";

import React, { useState, useEffect } from "react";
import styles from "./saveFiles.module.css";

export default function SaveFilesPage() {
  const [folders, setFolders]         = useState([]);
  const [selectedFolder, setSelected] = useState("");
  const [leads, setLeads]             = useState([]);
  const [loadingFolders, setLoadingF] = useState(false);
  const [loadingLeads, setLoadingL]   = useState(false);
  const [error, setError]             = useState("");

  // Load the list of folders
  useEffect(() => {
    setLoadingF(true);
    fetch("/api/folder")
      .then((r) => r.json())
      .then((d) => setFolders(d.folders || []))
      .catch(() => setError("Failed to load folders"))
      .finally(() => setLoadingF(false));
  }, []);

  // When a folder is selected, fetch its leads
  const handleSelect = (folder) => {
    setSelected(folder);
    setLoadingL(true);
    setError("");
    fetch(`/api/leads?folder=${encodeURIComponent(folder)}`)
      .then((r) => r.json())
      .then((d) => setLeads(d.leads || []))
      .catch(() => setError("Failed to load leads"))
      .finally(() => setLoadingL(false));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Saved Folders</h2>
      {error && <p className={styles.error}>{error}</p>}

      {/* 1) Folders list (hidden once a folder is selected) */}
      {!selectedFolder && (
        loadingFolders
          ? <p>Loading folders…</p>
          : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Folder Name</th>
                  <th># Leads</th>
                </tr>
              </thead>
              <tbody>
                {folders.map((f) => (
                  <tr
                    key={f}
                    className={f === selectedFolder ? styles.selectedRow : ""}
                    onClick={() => handleSelect(f)}
                  >
                    <td>{f}</td>
                    <td>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
      )}

      {/* 2) Leads table */}
      {selectedFolder && (
        <div className={styles.leadsSection}>
          <button
            className={styles.backBtn}
            onClick={() => setSelected("")}
          >
            ← Back to folders
          </button>
          <h3>Leads in: {selectedFolder}</h3>

          {loadingLeads
            ? <p>Loading leads…</p>
            : (
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
                    {leads.map((b, i) => (
                      <tr key={i}>
                        <td>{b.name}</td>
                        <td>{b.phone || "-"}</td>
                        <td>
                          {b.website
                            ? <a href={b.website} target="_blank" rel="noopener">
                                {new URL(b.website).hostname}
                              </a>
                            : "-"
                          }
                        </td>
                        <td>{b.rating != null ? b.rating.toFixed(1) : "-"}</td>
                        <td>{b.reviews ?? "-"}</td>
                        <td>{b.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
