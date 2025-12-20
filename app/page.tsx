"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

const taglineOptions = [
  "Your money, managed your way.",
  "Banking made simple, just for you.",
  "All your banking. One simple app.",
  "Take control of your finances in seconds.",
  "Start your journey to effortless banking."
];

export default function Home() {
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaglineIndex(
        (prev) => (prev + 1) % taglineOptions.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const letters = taglineOptions[currentTaglineIndex].split("");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.starter}>
            <div className={styles.starterContent}>
              <div className={styles.starterTitle}>Let’s get started<br />with <span>VuPay</span></div>
              <div className={styles.starterSubTitle}>Fast payments. Secure banking. Total control.</div>
              <div className={styles.starterDescription1}>Whether you’re sending money, paying bills, or checking your balance, VuPay makes everyday banking simple and stress-free—all from one powerful app. Enjoy instant transactions, real-time updates, and secure access designed to keep your money moving smoothly.</div>
              <div className={styles.starterDescription2}>Tap. Pay. Relax.</div>
              <div className={styles.starterDescription3}>
                {letters.map((char, i) => (
                  <span
                    key={`${currentTaglineIndex}-${i}`}
                    className={styles.char}
                    style={{
                      animationDelay: `${i * 40}ms`,
                    }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </div>
              <button
                onClick={() => router.push("/login")}
                className={styles.starterButton}
              >Get Started</button>
            </div>
          </div>
          <div className={styles.imageContainer}>
            <Image
              src="/phoneArray.png"
              alt="Logo"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </main>
    </div>
  );
}
