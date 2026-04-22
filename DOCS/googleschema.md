# Measure ecommerce

You can set up ecommerce events to collect information about the shopping
behavior of your users. The events enable you to quantify your most popular
products and see the influence of promotions and product placement on revenue.

This document describes each ecommerce event and when to set up the event. For a
step-by-step example of how to set up an ecommerce event, see [Set up a purchase
event](https://developers.google.com/analytics/devguides/collection/ga4/set-up-ecommerce).

> [!IMPORTANT]
> **Important:** [Web display dynamic
> remarketing](https://developers.google.com/tag-platform/devguides/dynamic-remarketing) is available in Google Analytics. This feature allows advertisers to transfer dynamic attributes, such as product IDs or price values, directly to Google Ads for dynamic remarketing campaigns. This eliminates the need to manually define and map parameters, simplifying the setup process and enabling more dynamic and relevant ad experiences.

> [!NOTE]
> **Got 3 mins?** Help us improve the Google Analytics ecommerce documentation by taking [a quick online survey](https://forms.gle/tVx6iijCWP2zWyUU9).

<button value="gtag" default="">gtag.js</button> <button value="gtm">Tag Manager</button>

## Before you begin

Make sure you've [added the Google tag to your website](https://support.google.com/analytics/answer/9304153#add-tag&zippy=%2Cadd-the-google-tag-directly-to-your-web-pages) and can access Analytics
and the website source code.

## Recommendations

- [Enable debug mode](https://support.google.com/analytics/answer/7201382) so you can see events in realtime and troubleshoot issues.
- Review [the custom dimension and metric limits](https://support.google.com/analytics/answer/10075209#limits) when sending custom parameters with ecommerce events.
- Set `currency` when sending `value` (revenue) data to ensure revenue metrics are calculated correctly.
- Set each ecommerce parameter you have data for, regardless of whether the parameter is optional.
- Use [the sample ecommerce website](https://enhancedecommerce.appspot.com/) to see an example of how to tag your website.
- To ensure data populates properly in reports, follow the format in this document. If you need to set the items array outside of the ecommerce array, set the `currency` parameter at the event level when you send `value` (revenue) data.

## Set up Google Ads Dynamic remarketing

Dynamic remarketing lets you show your website and app users ads that are
relevant to the specific products and services they viewed. Other benefits
include:

- **Simple implementation**: You don't need to manually map parameters between your website and Google Ads.
- **Event-based setup** : To enable dynamic remarketing, implement the recommended events for your business type. Learn more about [Dynamic remarketing events
  and parameters](https://support.google.com/google-ads/answer/7305793).

## Implementation

A typical ecommerce implementation measures any of the following actions:

- [Select an item from a list](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#select_an_item_from_a_list)
- [View item details](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#view_item_details)
- [Add/remove a product from a shopping cart](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#add_or_remove_an_item_from_a_shopping_cart)
- [Initiate the checkout process](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#initiate_the_checkout_process)
- [Make purchases or refunds](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#make_a_purchase_or_issue_a_refund)
- [Apply promotions](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce#apply_promotions)

At the heart of these actions are the products and services you sell. You can
represent products and services as an array of items that can be added to
ecommerce events. You can include up to 27 custom parameters in the items array,
in addition to the prescribed parameters.

The following example demonstrates how to create the collection of `items` that
are referenced throughout this guide. The `items` array can include up to 200
elements.

    items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        },
        {
          item_id: "SKU_12346",
          item_name: "Google Grey Women's Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 3.33,
          index: 1,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 21.01,
          google_business_vertical: "retail",
          quantity: 2
        }
    ]

## Select an item from a list

When a user is presented with a list of results, send a `view_item_list` event
including an `items` array parameter containing the displayed items. For details
on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#view_item_list).

    gtag("event", "view_item_list", {
      item_list_id: "related_products",
      item_list_name: "Related products",
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

Once a user selects an item from the list, send the `select_item` event with the
selected item in an `items` array parameter. For details on the parameters to
send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#select_item).

    gtag("event", "select_item", {
      item_list_id: "related_products",
      item_list_name: "Related products",
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

## View item details

To measure how many times item details are viewed, send a `view_item` event
whenever a user views an item's details screen. For details on the parameters to
send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#view_item).

    gtag("event", "view_item", {
      currency: "USD",
      value: 30.03,
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

## Add or remove an item from a shopping cart

Measure an item being added to a shopping cart by sending an `add_to_cart` event
with the relevant items in an `items` array. For details on the parameters to
send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#add_to_cart).

    gtag("event", "add_to_cart", {
      currency: "USD",
      value: 30.03,
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

You can also measure when an item is added to a wishlist by sending an
`add_to_wishlist` event with the relevant items in an `items` array. For details
on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#add_to_wishlist).

    gtag("event", "add_to_wishlist", {
      currency: "USD",
      value: 30.03,
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ],
    });

When a user subsequently views the cart, send the `view_cart` event with all
items in the cart. For details on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#view_cart).

    gtag("event", "view_cart", {
      currency: "USD",
      value: 30.03,
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

To measure when a user removes an item from a cart, send the `remove_from_cart`
event. For details on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#remove_from_cart).

    gtag("event", "remove_from_cart", {
      currency: "USD",
      value: 30.03,
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

## Initiate the checkout process

Measure the first step in a checkout process by sending a `begin_checkout` event
with one or more items defined with the relevant fields. A coupon can also be
added at this stage to the entire order by adding it to the event or applied to
a particular item by adding it to specific elements in the `items` array. For
details on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#begin_checkout).

    gtag("event", "begin_checkout", {
      currency: "USD",
      value: 30.03,
      coupon: "SUMMER_FUN",
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

When a user proceeds to the next step in the checkout process and adds shipping
information, send an `add_shipping_info` event. Use the parameter
`shipping_tier` to specify the user's delivery option, such as "Ground", "Air",
or "Next-day". For details on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#add_shipping_info).

    gtag("event", "add_shipping_info", {
      currency: "USD",
      value: 30.03,
      coupon: "SUMMER_FUN",
      shipping_tier: "Ground",
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

Send the `add_payment_info` event when a user submits their payment information.
If applicable, include `payment_type` with this event for the chosen method of
payment. For details on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#add_payment_info).

    gtag("event", "add_payment_info", {
      currency: "USD",
      value: 30.03,
      coupon: "SUMMER_FUN",
      payment_type: "Credit Card",
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

## Make a purchase or issue a refund

Measure a purchase by sending a `purchase` event with one or more items defined
with the relevant fields. For details on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#purchase).

    gtag("event", "purchase", {
        transaction_id: "T_12345",
        // Sum of (price * quantity) for all items.
        value: 72.05,
        tax: 3.60,
        shipping: 5.99,
        currency: "USD",
        coupon: "SUMMER_SALE",
        customer_type: "new",
        items: [
         {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        },
        {
          item_id: "SKU_12346",
          item_name: "Google Grey Women's Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 3.33,
          index: 1,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "gray",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 21.01,
          promotion_id: "P_12345",
          promotion_name: "Summer Sale",
          google_business_vertical: "retail",
          quantity: 2
        }]
    });

> [!NOTE]
> **Note:** The `purchase` event replaces ecommerce_purchase and is different from the in_app_purchase event, which is reported automatically.

Measure refunds by sending a `refund` event with the relevant `transaction_id`
specified and one or more items defined with `item_id` and `quantity`. We
recommend that you include item information in your `refund` event to see
item-level refund metrics in Analytics.

For details on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#refund).

    gtag("event", "refund", {
      currency: "USD",
      transaction_id: "T_12345", // Transaction ID. Required for purchases and refunds.
      value: 30.03,
      coupon: "SUMMER_FUN",
      shipping: 3.33,
      tax: 1.11,
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

> [!NOTE]
> **Note:** The refund event replaces `ecommerce_refund`.

## Apply promotions

Ecommerce includes support for measuring impressions and clicks of internal
promotions, such as banners displayed to promote a sale.

Promotion impressions are typically measured with the initial screen view by
sending the `view_promotion` event with an items parameter to specify the
promoted item. For details on the parameters to send, see the [Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#view_promotion).

    gtag("event", "view_promotion", {
      creative_name: "Summer Banner",
      creative_slot: "featured_app_1",
      promotion_id: "P_12345",
      promotion_name: "Summer Sale",
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ]
    });

To indicate a user clicked on a promotion, send a `select_promotion` event with
that item as an item parameter. For details on the parameters to send, see the
[Events
reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#select_promotion).

    gtag("event", "select_promotion", {
      creative_name: "Summer Banner",
      creative_slot: "featured_app_1",
      promotion_id: "P_12345",
      promotion_name: "Summer Sale",
      items: [
        {
          item_id: "SKU_12345",
          item_name: "Stan and Friends Tee",
          affiliation: "Google Merchandise Store",
          coupon: "SUMMER_FUN",
          discount: 2.22,
          index: 0,
          item_brand: "Google",
          item_category: "Apparel",
          item_category2: "Adult",
          item_category3: "Shirts",
          item_category4: "Crew",
          item_category5: "Short sleeve",
          item_list_id: "related_products",
          item_list_name: "Related Products",
          item_variant: "green",
          location_id: "ChIJIQBpAG2ahYAR_6128GcTUEo",
          price: 10.01,
          google_business_vertical: "retail",
          quantity: 3
        }
      ],
    });