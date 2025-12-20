"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAccountDetails } from "../../services/api";
import styles from "./page.module.css";

interface Account {
    account_number: string;
    account_holder_name: string;
    balance: number;
    debit_card_number: string;
}

export default function AccountSelectionPage() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // In a real scenario, you would fetch the token from cookies or context
        // and the phone number from localStorage or context
        // Since getAccountDetails was called in the previous step (OTP page), 
        // we might expect the data to be passed via state management or re-fetched.
        // For this demo, let's assume we fetch it again using keys from storage, 
        // OR we use the mock data provided in the prompt if fetching fails/is complicated here.

        const fetchAccounts = async () => {
            try {
                // Retrieving token from cookie (simple parsing)
                const tokenMatch = document.cookie.match(/session_token=([^;]+)/);
                const token = tokenMatch ? tokenMatch[1] : null;
                const phoneNumber = localStorage.getItem("phoneNumber");

                if (token && phoneNumber) {
                    const result = await getAccountDetails(token, phoneNumber);
                    if (result.success && Array.isArray(result.data)) {
                        setAccounts(result.data);
                    } else {
                        // Fallback to mock data if API fails or returns non-array (for dev)
                        // But prompt specifically gave mock data example of what backend returns.
                        // Use mock data if API fails for now to satisfy request visualization?
                        // The user request shows the structure they expect.

                        // If API returns successfully, use it.
                        // If not, show error.
                        if (result.data) {
                            // Assuming result.data IS the array based on user prompt showing array request/response
                            setAccounts(result.data);
                        } else {
                            setError("Failed to load accounts.");
                        }
                    }
                } else {
                    setError("Session expired. Please login again.");
                    router.push("/login");
                }
            } catch (err) {
                setError("An error occurred while fetching accounts.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAccounts();
    }, [router]);

    const handleAccountSelect = (account: Account) => {
        // Select account and navigate to dashboard
        console.log("Selected account:", account);
        // Store selected account info if needed
        localStorage.setItem("selectedAccount", JSON.stringify(account));
        router.push("/dashboard");
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginContainer}>
                <div className={styles.loginForm}>
                    <div className={styles.title}>Account Selection</div>
                    <div className={styles.subtitle}>Choose an account to proceed</div>

                    {loading ? (
                        <p className={styles.message}>Loading accounts...</p>
                    ) : error ? (
                        <p className={styles.message} style={{ color: "red" }}>{error}</p>
                    ) : (
                        <div className={styles.accountList}>
                            {accounts.map((acc) => (
                                <div
                                    key={acc.account_number}
                                    className={styles.accountCard}
                                    onClick={() => handleAccountSelect(acc)}
                                >
                                    <div className={styles.accountHeader}>
                                        <span className={styles.accountName}>{acc.account_holder_name}</span>
                                        <span className={styles.accountBalance}>${acc.balance.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.accountNumber}>
                                        Account: {acc.account_number}
                                    </div>
                                    <div className={styles.accountNumber}>
                                        Card: **** **** **** {acc.debit_card_number.slice(-4)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.view}>
                <div className={styles.viewTitle}>Seamless Cross-Platform Access</div>
                <div className={styles.viewSubtitle}>
                    Use VuPay anytime, anywhere—on mobile or web. Your account stays perfectly in sync across all your devices. <br />
                    Enjoy a smooth, unified banking experience across platforms without missing a beat.
                </div>
                <div className={styles.viewBody}>
                    <Image
                        src="/accountSelection.png"
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
