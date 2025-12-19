"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";
// Importing icon assuming it's supported by Next.js configuration or treating it as static
import IconKey from "../icon.svg";

interface Account {
    account_number: string;
    account_holder_name: string;
    balance: number;
    debit_card_number: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [account, setAccount] = useState<Account | null>(null);
    const [showBalance, setShowBalance] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");

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
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return <div className={styles.container}>Loading dashboard...</div>;
    }

    if (!account) {
        return null; // Or redirect
    }

    const maskedBalance = "••••••";
    const navItems = ["dashboard", "overview", "wallet", "loans", "investments", "cards"];

    return (
        <div className={styles.dashboardContainer}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <Image
                        src={IconKey}
                        alt="VuPay Logo"
                        width={40}
                        height={40}
                        style={{ borderRadius: '50%' }}
                    />
                    <span className={styles.logoText}>VuPay</span>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <div
                            key={item}
                            className={`${styles.navItem} ${activeTab === item ? styles.activeNavItem : ''}`}
                            onClick={() => setActiveTab(item)}
                        >
                            {item}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                {activeTab === 'dashboard' ? (
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <div className={styles.welcome}>Welcome back,</div>
                            <div className={styles.userName}>{account.account_holder_name}</div>
                        </div>

                        <div className={styles.balanceCard}>
                            <div className={styles.balanceLabel}>Total Balance</div>
                            <div className={styles.balanceRow}>
                                <div className={styles.balanceAmount}>
                                    {showBalance ? `$${account.balance.toLocaleString()}` : maskedBalance}
                                </div>
                                <button
                                    className={styles.eyeButton}
                                    onClick={() => setShowBalance(!showBalance)}
                                    aria-label="Toggle Balance Visibility"
                                >
                                    {showBalance ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className={styles.accountNumber}>
                                {account.account_number}
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button
                                className={styles.actionButton}
                                onClick={() => router.push("/dashboard/transaction")}
                            >
                                Make Transaction
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.card}>
                        <h2 className={styles.userName}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                        <p style={{ marginTop: '20px', color: 'var(--text-color-2)' }}>This section is coming soon.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
