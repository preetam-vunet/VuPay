export const loginUser = async (phone_number: string, password: string) => {
    try {
        const response = await fetch("https://216.48.191.10:8443/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                phone_number,
                password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            return { success: false, message: "Login failed." };
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "An error occurred." };
    }
};

export const verifyOtp = async (transaction_id: string, otp: string) => {
    try {
        const response = await fetch("https://216.48.191.10:8443/auth/verify-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                transaction_id,
                otp,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            return { success: false, message: "OTP verification failed." };
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "An error occurred." };
    }
};

export const resendOtp = async (transaction_id: string) => {
    try {
        const response = await fetch("https://216.48.191.10:8443/auth/resend-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                transaction_id,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            return { success: false, message: "Failed to resend OTP." };
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "An error occurred." };
    }
};

export const getAccountDetails = async (token: string, phone: string) => {
    try {
        const response = await fetch("https://216.48.191.10:8443/account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            // body: JSON.stringify({
            //     phone
            // }),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            return { success: false, message: "Failed to fetch account details." };
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "An error occurred." };
    }
};

export const initiatePayment = async (token: string, paymentData: any) => {
    try {
        const response = await fetch("https://216.48.191.10:8443/payment/initiate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(paymentData),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            return { success: false, message: "Payment initiation failed." };
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "An error occurred." };
    }
};

export const verifyAccountPassword = async (phone_number: string, account_number: string, account_password: string, token: string) => {
    try {
        const response = await fetch("https://216.48.191.10:8443/password/verify-account", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                phone_number,
                account_number,
                account_password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            return { success: false, message: "Password verification failed." };
        }
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "An error occurred." };
    }
};
