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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Sending...");

    const result = await loginUser(phoneNumber, password);

    if (result.success && result.data?.success) {
      console.log("Success:", result.data);
      setMessage("Login successful! Redirecting...");
      localStorage.setItem("transactionId", result.data.transaction_id);
      localStorage.setItem("phoneNumber", phoneNumber);
      router.push("/otp-verification");
    } else {
      setMessage(result.message || "Login failed.");
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
            <button type="submit" className={styles.button}>Login</button>
          </form>
          {/* {message && <p className={styles.message} style={{ marginTop: "1rem" }}>{message}</p>} */}
        </div>
      </div>
      <div className={styles.view}>
        <div className={styles.viewBody}>
          {/* <Image
            src="/TwoPhones.png"
            alt="Login Visual"
            className={styles.image}
            priority
            width={100}
            height={100}
          /> */}
        </div>
      </div>
    </div>
  );
}
