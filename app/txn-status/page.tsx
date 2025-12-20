"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getTransactions } from "../../services/api";
import styles from "./page.module.css";

interface Transaction {
    txnRef: string;
    status: string;
    amount: number;
    accountNo: string;
    createdAt: string;
    userId: string;
    type: string;
}

export default function TxnStatusPage() {
    const router = useRouter();
    // const searchParams = useSearchParams();
    // const txnRefParam = searchParams.get("txnRef");
    const [txnRef, setTxnRef] = useState<string | null>(null);
    const [status, setStatus] = useState("PROCESSING");
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [pollingCount, setPollingCount] = useState(0);

    useEffect(() => {
        // Get txnRef from localStorage if not provided (or passed via query, but localStorage is easier from the flow transition)
        // Actually, let's prefer localStorage as we set it there in the previous step (planned)
        // But wait, in the previous step I planned to set it in localStorage.
        const storedRef = localStorage.getItem("currentTxnRef");
        if (storedRef) {
            setTxnRef(storedRef);
        } else {
            // Fallback or error
            console.log("No transaction reference found.");
        }
    }, []);

    useEffect(() => {
        if (!txnRef) return;

        const checkStatus = async () => {
            // Retrieve token from cookie
            const tokenMatch = document.cookie.match(/session_token=([^;]+)/);
            const token = tokenMatch ? tokenMatch[1] : null;
            const phoneNumber = localStorage.getItem("phoneNumber");

            if (token && phoneNumber) {
                const result = await getTransactions(token, phoneNumber);
                if (result.success && result.data?.transactions) {
                    const foundTxn = result.data.transactions.find((t: Transaction) => t.txnRef === txnRef);
                    if (foundTxn) {
                        setTransaction(foundTxn);
                        setStatus(foundTxn.status);

                        if (foundTxn.status === "SUCCESS" || foundTxn.status === "FAILED") {
                            // Stop polling implicitly by not setting timeout if we were using a recursive function, 
                            // but here we are using interval.
                            return true; // Finished
                        }
                    }
                }
            }
            return false;
        };

        const intervalId = setInterval(async () => {
            if (pollingCount > 20) { // Timeout after ~60s
                clearInterval(intervalId);
                return;
            }

            setPollingCount(prev => prev + 1);
            const finished = await checkStatus();
            if (finished) {
                clearInterval(intervalId);
            }
        }, 3000);

        // Initial check
        checkStatus();

        return () => clearInterval(intervalId);
    }, [txnRef, pollingCount]);

    const renderStatusIcon = () => {
        if (status === "SUCCESS") {
            return (
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            );
        } else if (status === "FAILED") {
            return (
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            );
        } else {
            return <div className={styles.spinner}></div>;
        }
    };

    const getStatusMessage = () => {
        if (status === "SUCCESS") return "Transaction Completed Successfully";
        if (status === "FAILED") return "Transaction Failed";
        return "Processing Transaction...";
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginContainer}>
                <div className={styles.loginForm}> {/* Using loginForm for structural consistency */}
                    <div className={styles.statusContainer}>
                        <div className={styles.statusIcon}>
                            {renderStatusIcon()}
                        </div>
                        <div className={styles.statusText}>
                            {status === "PROCESSING" ? "Processing..." : status}
                        </div>
                        <div className={styles.statusMessage}>
                            {getStatusMessage()}
                        </div>

                        {transaction && (
                            <div className={styles.detailsContainer}>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Transaction ID</span>
                                    <span className={styles.detailValue}>{transaction.txnRef.slice(0, 18)}...</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Amount</span>
                                    <span className={styles.detailValue}>₹{transaction.amount}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Type</span>
                                    <span className={styles.detailValue}>{transaction.type}</span>
                                </div>
                                <div className={styles.detailRow}>
                                    <span className={styles.detailLabel}>Date</span>
                                    <span className={styles.detailValue}>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}

                        <button
                            className={styles.button}
                            onClick={() => router.push("/dashboard")}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.view}>
                <div className={styles.viewTitle}>Secure & Fast</div>
                <div className={styles.viewSubtitle}>
                    Your transaction is being processed securely. <br />
                    We ensure end-to-end encryption for all your payments.
                </div>
                <div className={styles.viewBody}>
                    <Image
                        src="/transaction.png"
                        alt="Transaction Visual"
                        fill
                        style={{ objectFit: "contain" }}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
