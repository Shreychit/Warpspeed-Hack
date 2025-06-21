// REPLACE ENTIRE FILE

// Analytics API helper functions
// Calls backend endpoint to retrieve analytics data for given delivery platform.
// If the backend call fails, falls back to a small mock so that the UI still works.

const API_BASE_URL = "https://prompt-me-harder-backend.onrender.com/analytics";

// Minimal mock fallback in case backend is unreachable
const fallbackAnalytics = {
    merchant: {
        merchantId: "0",
        displayName: "Unknown Merchant",
    },
    analytics: [],
};

/**
 * Fetch analytics for a particular platform.
 * @param {string} platform e.g. "swiggy", "zomato", "magicpin"
 * @returns {Promise<{merchant: object, analytics: array}>}
 */
export const fetchAnalyticsByPlatform = async (platform) => {
    try {
        const url = `${API_BASE_URL}/${platform}/102157665201439458654`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed with status ${response.status}`);
        }
        const json = await response.json();
        // Expected shape: { status, generatedAt, data: { merchant, analytics: [] } }
        return json.data ?? fallbackAnalytics;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching analytics:", error);
        return fallbackAnalytics;
    }
}; 