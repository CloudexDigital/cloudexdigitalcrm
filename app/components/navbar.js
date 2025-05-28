"use client";
import React, { useState } from "react";
import { SignInButton, SignOutButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import styles from "./navbar.module.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isSignedIn, user } = useAuth();

  return (
    <nav className={styles.navbar}>
      {/* Brand link */}
      <Link href="/" className={styles.brand}>
        CLOUDEX DIGITAL
      </Link>
      {/* Hamburger toggle */}
      <button
        className={styles.toggle}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>

      {/* Navigation links */}
      <div className={`${styles.menu} ${open ? styles.active : ""}`}>
        <Link
          href="/webScraper"
          className={styles.menuLink}
          onClick={() => setOpen(false)}
        >
          Web Scraper
        </Link>
        <Link
          href="/saveFiles"
          className={styles.menuLink}
          onClick={() => setOpen(false)}
        >
          Folders
        </Link>
        <div className={styles.authControls}>
          {isSignedIn ? (
            <>
              <SignOutButton>
                <button className={styles.authBtn}>Sign Out</button>
              </SignOutButton>
            </>
          ) : (
            <SignInButton>
              <button className={styles.authBtn}>Sign In</button>
            </SignInButton>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
