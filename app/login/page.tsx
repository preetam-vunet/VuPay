"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginUser } from "../../services/api";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Sending...");

    const result = await loginUser(phoneNumber, password);

    if (result.success && result.data?.success) {
      console.log("Success:", result.data);
      setMessage("Login successful! Redirecting...");
      localStorage.setItem("transactionId", result.data.transaction_id);
      localStorage.setItem("phoneNumber", phoneNumber);
      router.push("/otp-verification");
      // Keep loading true while redirecting
    } else {
      setMessage(result.message || "Login failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.loginForm}>
          <div className={styles.title}>Login</div>
          <div className={styles.subtitle}>For Seamless Payments</div>
          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.label}>Phone Number</div>
              <input
                type="number"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.label}>Password</div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <button
              type="submit"
              className={styles.button}
              disabled={isLoading}
              style={{ pointerEvents: isLoading ? "none" : "auto" }}
            >
              {isLoading ? <span className={styles.spinner}></span> : "Login"}
            </button>
          </form>
          {message && <p className={styles.message} style={{ marginTop: "1rem", color: "black" }}>{message}</p>}
        </div>
      </div>
      <div className={styles.view}>
        <div className={styles.viewTitle}>Your dashboard at a glance</div>
        <div className={styles.viewSubtitle}>
          Track balances, recent transactions, and manage your money effortlessly. <br />
          Get real-time updates, quick actions, and a clear view of your finances—all in one place.
        </div>
        <div className={styles.viewBody}>
          <Image
            src="/dashboard3.png"
            alt="Logo"
            fill
            style={{ objectFit: "contain" }}
            priority
          />
        </div>
      </div>
    </div>
  );
}
