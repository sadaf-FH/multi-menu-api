const axios = require("axios");
const API = "http://localhost:3000";

function hhmmss(date) {
  return date.toTimeString().slice(0, 8);
}

function activeWindow() {
  const now = new Date();
  return {
    available_from: hhmmss(new Date(now.getTime() - 60 * 60 * 1000)),
    available_to: hhmmss(new Date(now.getTime() + 60 * 60 * 1000)),
  };
}

function inactiveWindow() {
  const now = new Date();
  return {
    available_from: hhmmss(new Date(now.getTime() - 4 * 60 * 60 * 1000)),
    available_to: hhmmss(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
  };
}

(async () => {
  try {
    console.log("\nFull API Flow Test\n");

    const restaurantRes = await axios.post(`${API}/restaurants`, {
      name: "Offer Test Kitchen",
      location: "Bangalore",
      timezone: "Asia/Kolkata",
    });

    const restaurantId = restaurantRes.data.data.R_ID;
    console.log("Restaurant:", restaurantId);

    const active = activeWindow();
    const inactive = inactiveWindow();

    await axios.post(`${API}/menus`, {
      restaurantId,
      version: 1,
      categories: [
        {
          name: "Italian",
          avg_price: 200,
          items: [
            {
              time: active,
              prices: [{ order_type: "DINE_IN", price: 300 }],
            },
            {
              time: inactive,
              prices: [{ order_type: "DINE_IN", price: 250 }],
            },
          ],
        },
        {
          name: "Chinese",
          avg_price: 150,
          items: [
            {
              time: active,
              prices: [{ order_type: "DINE_IN", price: 180 }],
            },
          ],
        },
      ],
    });

    console.log("Menu created");

    const menuFetch = await axios.get(`${API}/menus/restaurant/${restaurantId}`);
    const menu = menuFetch.data.data;

    console.log("\nMenu BEFORE offers (time filtered):");
    console.dir(menu, { depth: 6 });

    const italianCategory = menu.Categories.find(c => c.name === "Italian");
    const chineseCategory = menu.Categories.find(c => c.name === "Chinese");

    const italianItem = italianCategory.Items[0];
    const chineseItem = chineseCategory.Items[0];

    console.log("Italian item:", italianItem.item_id);
    console.log("Chinese item:", chineseItem.item_id);

    await axios.post(`${API}/offers`, {
      item_id: italianItem.item_id,
      type: "PERCENT",
      amount: 20,
      max_discount: 100,
    });

    await axios.post(`${API}/offers`, {
      category_id: chineseCategory.category_id,
      type: "FLAT",
      amount: 50,
      max_discount: 50,
    });

    const finalMenuRes = await axios.get(
      `${API}/menus/restaurant/${restaurantId}`
    );

    const finalMenu = finalMenuRes.data.data;

    console.log("\nMenu AFTER offers:");
    for (const category of finalMenu.Categories) {
      console.log(`\nCategory: ${category.name}`);
      for (const item of category.Items) {
        for (const price of item.ItemPrices) {
          console.log({
            item_id: item.item_id,
            base_price: price.base_price,
            final_price: price.final_price,
            discount: price.discount,
            applied_offer: price.applied_offer,
          });
        }
      }
    }

    console.log("\nFull flow test completed successfully");

  } catch (err) {
    console.error("\nTest failed");
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
})();
