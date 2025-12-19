"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initiatePayment } from "../../../services/api";
import styles from "./page.module.css";

interface Account {
    account_number: string;
    account_holder_name: string;
    // other fields...
}

export default function TransactionPage() {
    const router = useRouter();
    const [account, setAccount] = useState<Account | null>(null);

    // Form fields
    const [beneficiaryName, setBeneficiaryName] = useState("");
    const [beneficiaryAccount, setBeneficiaryAccount] = useState("");
    const [amount, setAmount] = useState("");

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

    const handleTransaction = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        if (!account) {
            setMessage("Account information missing.");
            return;
        }

        // Basic validation
        if (!beneficiaryName || !beneficiaryAccount || !amount) {
            setMessage("Please fill all fields.");
            return;
        }

        setIsLoading(true);

        // Retrieve token
        const tokenMatch = document.cookie.match(/session_token=([^;]+)/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            setMessage("Session expired. Please login again.");
            setIsLoading(false);
            return;
        }

        // Construct payload
        const payload = {
            userId: account.account_holder_name, // Using holder name as userId (sender)
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
            // Optional: Redirect or clear form
            // router.push("/dashboard"); 
        } else {
            setMessage(result.message || "Transaction failed.");
        }
        setIsLoading(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.title}>Make Transaction</div>
                <div className={styles.subtitle}>Enter details for digital transfer</div>

                <form onSubmit={handleTransaction} className={styles.form}>
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

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading}
                        style={{ pointerEvents: isLoading ? "none" : "auto" }}
                    >
                        {isLoading ? <span className={styles.spinner}></span> : "Transfer"}
                    </button>
                    {message && <div className={styles.message} style={{ color: message.toLowerCase().includes("success") ? "green" : "red" }}>{message}</div>}

                    <button
                        type="button"
                        className={styles.button}
                        onClick={() => router.push("/dashboard")}
                        style={{ background: "transparent", color: "var(--text-color-2)", border: "1px solid var(--text-color-2)", fontSize: "16px", marginTop: "10px" }}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
