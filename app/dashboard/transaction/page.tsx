"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initiatePayment, verifyAccountPassword, verifyOtp } from "../../../services/api";
import styles from "./page.module.css";

interface Account {
    account_number: string;
    account_holder_name: string;
    // other fields...
}

export default function TransactionPage() {
    const router = useRouter();
    const [account, setAccount] = useState<Account | null>(null);

    // Steps: 'details' | 'password' | 'otp'
    const [step, setStep] = useState<"details" | "password" | "otp">("details");

    // Form fields
    const [beneficiaryName, setBeneficiaryName] = useState("");
    const [beneficiaryAccount, setBeneficiaryAccount] = useState("");
    const [amount, setAmount] = useState("");

    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [transactionId, setTransactionId] = useState<string | null>(null);

    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const storedAccount = localStorage.getItem("selectedAccount");
        if (storedAccount) {
            try {
                setAccount(JSON.parse(storedAccount));
            } catch (e) {
                console.error("Failed to parse account data", e);
                router.push("/account-selection");
            }
        } else {
            router.push("/account-selection");
        }
    }, [router]);

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!beneficiaryName || !beneficiaryAccount || !amount) {
            setMessage("Please fill all fields.");
            return;
        }

        setStep("password");
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);

        const tokenMatch = document.cookie.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            setMessage("Session expired. Please login again.");
            setIsLoading(false);
            return;
        }

        const phoneNumber = localStorage.getItem("phoneNumber");
        if (!phoneNumber || !account) {
            setMessage("Missing user information.");
            setIsLoading(false);
            return;
        }

        const result = await verifyAccountPassword(phoneNumber, account.account_number, password, token);

        if (result.success && result.data?.transaction_id) {
            setTransactionId(result.data.transaction_id);
            setStep("otp");
            setMessage("Password verified. OTP sent.");
        } else {
            setMessage(result.message || "Password verification failed.");
        }
        setIsLoading(false);
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setIsLoading(true);


        if (!transactionId) {
            setMessage("Transaction ID missing.");
            setIsLoading(false);
            return;
        }

        // 1. Verify OTP
        const otpResult = await verifyOtp(transactionId, otp);

        if (otpResult.success && otpResult.data?.success) {
            setMessage("OTP Verified. Initiating Payment...");

            // 2. Initiate Payment
            await performPayment();
        } else {
            setMessage(otpResult.message || "OTP verification failed.");
            setIsLoading(false);
        }
    };

    const performPayment = async () => {
        if (!account) return;

        // Retrieve token
        const tokenMatch = document.cookie.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            setMessage("Session expired. Please login again.");
            setIsLoading(false);
            return;
        }

        const payload = {
            userId: account.account_holder_name,
            accountNo: account.account_number,
            type: "Digital Transfer",
            amount: parseFloat(amount),
            channel: "BROWSER",
            beneficiaryName: beneficiaryName,
            beneficiaryAccount: beneficiaryAccount
        };

        const result = await initiatePayment(token, payload);

        if (result.success) {
            console.log("Transaction Success:", result.data);
            setMessage(result.data.message || "Payment intent created successfully!");
            // maybe disable form or show success UI ??
        } else {
            setMessage(result.message || "Transaction failed.");
        }
        setIsLoading(false);
    };

    const renderStepDetails = () => (
        <form onSubmit={handleDetailsSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
                <div className={styles.label}>Beneficiary Name</div>
                <input
                    type="text"
                    value={beneficiaryName}
                    onChange={(e) => setBeneficiaryName(e.target.value)}
                    required
                    className={styles.input}
                    placeholder="e.g. Amit Sharma"
                />
            </div>
            <div className={styles.inputGroup}>
                <div className={styles.label}>Beneficiary Account</div>
                <input
                    type="text"
                    value={beneficiaryAccount}
                    onChange={(e) => setBeneficiaryAccount(e.target.value)}
                    required
                    className={styles.input}
                    placeholder="e.g. ACC2000000456"
                />
            </div>
            <div className={styles.inputGroup}>
                <div className={styles.label}>Amount</div>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className={styles.input}
                    placeholder="e.g. 1785.00"
                />
            </div>

            <button type="submit" className={styles.button}>Proceed</button>
        </form>
    );

    const renderStepPassword = () => (
        <form onSubmit={handlePasswordSubmit} className={styles.form}>
            <div className={styles.subtitle} style={{ marginBottom: "10px" }}>
                Verify Account Ownership
            </div>
            <div className={styles.inputGroup}>
                <div className={styles.label}>Account Password</div>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={styles.input}
                    placeholder="Enter Password"
                />
            </div>
            <button
                type="submit"
                className={styles.button}
                disabled={isLoading}
                style={{ pointerEvents: isLoading ? "none" : "auto" }}
            >
                {isLoading ? <span className={styles.spinner}></span> : "Verify Password"}
            </button>
        </form>
    );

    const renderStepOtp = () => (
        <form onSubmit={handleOtpSubmit} className={styles.form}>
            <div className={styles.subtitle} style={{ marginBottom: "10px" }}>
                Enter OTP sent to your phone
            </div>
            <div className={styles.inputGroup}>
                <div className={styles.label}>OTP</div>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    className={styles.input}
                    placeholder="Enter 6-digit OTP"
                />
            </div>
            <button
                type="submit"
                className={styles.button}
                disabled={isLoading}
                style={{ pointerEvents: isLoading ? "none" : "auto" }}
            >
                {isLoading ? <span className={styles.spinner}></span> : "Confirm Transfer"}
            </button>
        </form>
    );

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.title}>Make Transaction</div>
                <div className={styles.subtitle}>
                    {step === 'details' && "Enter details for digital transfer"}
                    {step === 'password' && "Security Verification"}
                    {step === 'otp' && "Final Confirmation"}
                </div>

                {step === 'details' && renderStepDetails()}
                {step === 'password' && renderStepPassword()}
                {step === 'otp' && renderStepOtp()}

                {message && <div className={styles.message} style={{ color: message.toLowerCase().includes("success") ? "green" : "red" }}>{message}</div>}

                <button
                    type="button"
                    className={styles.button}
                    onClick={() => router.push("/dashboard")}
                    style={{ background: "transparent", color: "var(--text-color-2)", border: "1px solid var(--text-color-2)", fontSize: "16px", marginTop: "10px" }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
