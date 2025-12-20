"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { verifyOtp, getAccountDetails, resendOtp, initiatePayment } from "../../services/api";
import styles from "./page.module.css";

export default function OtpPage() {
    const router = useRouter();
    const [transactionId, setTransactionId] = useState<string | null>(null);

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        const storedTransactionId = localStorage.getItem("transactionId");
        if (storedTransactionId) {
            setTransactionId(storedTransactionId);
        } else {
            setMessage("Transaction ID not found. Please login again.");
        }
    }, []);

    const handleResendOtp = async () => {
        if (!transactionId) return;

        setCanResend(false);
        setTimer(60);
        setMessage("Resending OTP...");

        const result = await resendOtp(transactionId);
        if (result.success) {
            setMessage("OTP Resent Successfully!");
        } else {
            setMessage(result.message || "Failed to resend OTP.");
            setCanResend(true); // Allow retry immediately if failed
            setTimer(0);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transactionId) {
            setMessage("Missing transaction ID. Please login again.");
            return;
        }

        setIsLoading(true);
        setMessage("Verifying OTP...");

        const result = await verifyOtp(transactionId, otp);
        const flowType = localStorage.getItem("flowType");

        if (result.success && result.data?.success) {
            if (flowType === "transaction") {
                setMessage("OTP Verified. Processing Payment...");

                const payloadStr = localStorage.getItem("paymentPayload");
                if (!payloadStr) {
                    setMessage("Payment details missing.");
                    setIsLoading(false);
                    return;
                }

                try {
                    const payload = JSON.parse(payloadStr);
                    // Retrieve token from cookie
                    const tokenMatch = document.cookie.match(/session_token=([^;]+)/);
                    const token = tokenMatch ? tokenMatch[1] : null;

                    if (!token) {
                        setMessage("Session expired. Please login again.");
                        setIsLoading(false);
                        return;
                    }

                    const paymentResult = await initiatePayment(token, payload);
                    if (paymentResult.success) {
                        setMessage(paymentResult.data.message || "Payment Successful!");

                        // Store txnRef for status page
                        if (paymentResult.data.txnRef) {
                            localStorage.setItem("currentTxnRef", paymentResult.data.txnRef);
                        }

                        // Clear transaction data
                        localStorage.removeItem("paymentPayload");
                        localStorage.removeItem("flowType");
                        localStorage.removeItem("transactionId");

                        setTimeout(() => {
                            router.push("/txn-status");
                        }, 1000);
                    } else {
                        setMessage(paymentResult.message || "Payment Failed.");
                        setIsLoading(false);
                    }
                } catch (e) {
                    setMessage("Invalid payment data.");
                    setIsLoading(false);
                }

            } else {
                // Login Flow
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

                // Clear flow type
                localStorage.removeItem("flowType");

                // Redirect to account selection
                router.push("/account-selection");
            }
        } else {
            setMessage(result.message || "Verification failed.");
            setIsLoading(false);
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
                        <button
                            type="submit"
                            className={styles.button}
                            disabled={isLoading}
                            style={{ pointerEvents: isLoading ? "none" : "auto" }}
                        >
                            {isLoading ? <span className={styles.spinner}></span> : "Verify OTP"}
                        </button>
                    </form>

                    <div style={{ textAlign: "center", color: "var(--text-color-2)" }}>
                        {canResend ? (
                            <button
                                onClick={handleResendOtp}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--text-color-2)",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontSize: "16px"
                                }}
                            >
                                Resend OTP
                            </button>
                        ) : (
                            <span>Resend OTP in {timer}s</span>
                        )}
                    </div>

                    {message && <p className={styles.message} style={{ marginTop: "1rem" }}>{message}</p>}
                </div>
            </div>
            <div className={styles.view}>
                <div className={styles.viewTitle}>Security You Can Trust</div>
                <div className={styles.viewSubtitle}>
                    Built with strong protection layers to keep your money and personal information safe at all times. <br />
                    Every transaction is secured using industry-leading security standards to ensure complete peace of mind.
                </div>
                <div className={styles.viewBody}>
                    <Image
                        src="/otpImage.png"
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
