// menuApi.js

// --- Mock API functions to fetch sample menu items ---
const sampleMenus = {
    swiggy: [
        { id: 1, name: 'Swiggy Burger', price: 5.99, image: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Swiggy Pizza', price: 8.99, image: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Swiggy Fries', price: 3.49, image: 'https://via.placeholder.com/150' },
    ],
    zomato: [
        { id: 1, name: 'Zomato Sandwich', price: 6.99, image: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Zomato Pasta', price: 7.49, image: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Zomato Salad', price: 4.99, image: 'https://via.placeholder.com/150' },
    ],
    magicpin: [
        { id: 1, name: 'Magicpin Wrap', price: 5.49, image: 'https://via.placeholder.com/150' },
        { id: 2, name: 'Magicpin Sushi', price: 9.99, image: 'https://via.placeholder.com/150' },
        { id: 3, name: 'Magicpin Noodles', price: 7.99, image: 'https://via.placeholder.com/150' },
    ],
};

const simulateFetch = (platform) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve(sampleMenus[platform] || []);
        }, 600);
    });

// exports for sample menus
export const fetchSwiggyMenu = () => simulateFetch('swiggy');
export const fetchZomatoMenu = () => simulateFetch('zomato');
export const fetchMagicpinMenu = () => simulateFetch('magicpin');
export const fetchMenuByPlatform = (platform) => simulateFetch(platform);

// --- Helper: fetch a truly random food image via TheMealDB API ---
async function getRandomMealImage() {
    try {
        const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        if (!resp.ok) throw new Error(`status ${resp.status}`);
        const data = await resp.json();
        // strMealThumb is the URL to the meal's image
        return data.meals?.[0]?.strMealThumb || 'https://via.placeholder.com/400x300?text=Food';
    } catch (err) {
        console.error('getRandomMealImage failed:', err);
        // fallback placeholder
        return 'https://via.placeholder.com/400x300?text=Food';
    }
}

// --- Fetch merchant's real menu from backend, with dynamic food-image fallback ---
export async function fetchMerchantMenu(platform, sub) {
    if (!platform || !sub) {
        throw new Error('Platform and user sub are required');
    }
    const endpoint = `https://prompt-me-harder-backend.onrender.com/merchant/${platform}/${sub}`;

    let json;
    try {
        const resp = await fetch(endpoint);
        if (!resp.ok) throw new Error(`Request failed with status ${resp.status}`);
        json = await resp.json();
    } catch (error) {
        console.error('Failed to fetch merchant menu:', error);
        return [];
    }

    const stores = json?.data?.merchant?.stores || [];

    // Iterate through each store and its items so we can attach storeId & storeName
    const itemPromises = stores.flatMap(store => {
        const storeName = store.name;
        const storeId = store.storeId ?? store.aggregatorStoreId;
        const storeStatus = store.status ?? 'unknown';

        const livePromo = (store.promos || []).find(p => p.status === 'live');

        return (store.menu || []).map(async item => {
            const imageUrl = item.image ? item.image : await getRandomMealImage();

            return {
                id: item.itemId ?? item.aggregatorItemId ?? Math.random().toString(36).slice(2),
                name: item.name,
                price: item.basePrice ?? 0,
                image: imageUrl,
                category: item.category,
                isVeg: item.isVeg,
                calories: item.calories,
                ratingAvg: item.rating?.avg ?? null,
                ratingCount: item.rating?.count ?? null,
                stockQty: item.stockQty ?? null,
                promo: livePromo || null,
                storeName,
                storeId,
                storeStatus,
            };
        });
    });

    // Wait for all Promises to resolve and return the full menu list
    return Promise.all(itemPromises);
}
