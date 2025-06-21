// Mock analytics data per platform

const sampleAnalytics = {
    swiggy: {
        mostPopularDish: 'Paneer Butter Masala',
        totalSales: 12345,
        bestHour: '7-8 PM',
        bestDay: 'Saturday',
    },
    zomato: {
        mostPopularDish: 'Chicken Biryani',
        totalSales: 9876,
        bestHour: '8-9 PM',
        bestDay: 'Friday',
    },
    magicpin: {
        mostPopularDish: 'Veg Burger',
        totalSales: 5432,
        bestHour: '6-7 PM',
        bestDay: 'Sunday',
    },
};

const simulateFetch = (platform) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(sampleAnalytics[platform] || sampleAnalytics.swiggy);
        }, 500);
    });

export const fetchSwiggyAnalytics = () => simulateFetch('swiggy');
export const fetchZomatoAnalytics = () => simulateFetch('zomato');
export const fetchMagicpinAnalytics = () => simulateFetch('magicpin');
export const fetchAnalyticsByPlatform = (platform) => simulateFetch(platform); 