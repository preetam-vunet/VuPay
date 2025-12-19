"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { verifyOtp, getAccountDetails } from "../../services/api";
import styles from "./page.module.css";

export default function OtpPage() {
    const router = useRouter();
    const [transactionId, setTransactionId] = useState<string | null>(null);

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const storedTransactionId = localStorage.getItem("transactionId");
        if (storedTransactionId) {
            setTransactionId(storedTransactionId);
        } else {
            setMessage("Transaction ID not found. Please login again.");
        }
    }, []);

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId) {
            setMessage("Missing transaction ID. Please login again.");
            return;
        }

        setMessage("Verifying OTP...");

        const result = await verifyOtp(transactionId, otp);

        if (result.success && result.data?.success) {
            setMessage("OTP Verified Successfully! Fetching account details...");
            console.log("OTP Verification Success:", result.data);

            const accessToken = result.data.access_token;
            const expiresIn = result.data.expires_in;

            // Store token in a cookie
            document.cookie = `session_token=${accessToken}; max-age=${expiresIn}; path=/; Secure; SameSite=Strict`;

            // Retrieve phone number and fetch account details
            const phoneNumber = localStorage.getItem("phoneNumber");
            if (phoneNumber) {
                const accountResult = await getAccountDetails(accessToken, phoneNumber);
                console.log("Account Details:", accountResult);
            } else {
                console.error("Phone number not found in localStorage");
            }

            // Redirect to account selection
            router.push("/account-selection");
        } else {
            setMessage(result.message || "Verification failed.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginContainer}>
                <div className={styles.loginForm}>
                    <div className={styles.title}>OTP Verification</div>
                    <div className={styles.subtitle}>Enter the OTP sent to your email</div>
                    <form onSubmit={handleOtpSubmit} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <div className={styles.label}>OTP</div>
                            <input
                                type="text"
                                id="otp"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                className={styles.input}
                            />
                        </div>
                        <button type="submit" className={styles.button}>Verify OTP</button>
                    </form>
                    {/* {message && <p className={styles.message} style={{ marginTop: "1rem" }}>{message}</p>} */}
                </div>
            </div>
            <div className={styles.view}>
                <div className={styles.viewBody}>
                    {/* <Image
                        src="/phone.png"
                        alt="Login Visual"
                        className={styles.image}
                        priority
                        width={1000}
                        height={1000}
                    /> */}
                </div>
            </div>
        </div>
    );
}
