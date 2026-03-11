# Provider Add-Payment Patch Setup

## 1) Load the patch in your plugin bootstrap

In your plugin main file (for example `planenadler-checkout-provider-api.php`), add:

```php
require_once __DIR__ . '/includes/planenadler-provider-add-payment-method-patch.php';
Planenadler_Provider_Add_Payment_Method_Patch::init();
```

If your old callback is still registered for the same route, remove it to avoid duplicate handlers.

## 2) Required `wp-config.php` constants

```php
// One of these secret constants must match Next.js WC_PROVIDER_API_SECRET:
define('WC_PROVIDER_API_SECRET', 'YOUR_LONG_RANDOM_SECRET');
// or:
define('PLANENADLER_PROVIDER_API_SECRET', 'YOUR_LONG_RANDOM_SECRET');

// Allow return/callback origins (https in production, localhost http is allowed for dev):
define('WC_PROVIDER_ALLOWED_RETURN_ORIGINS', 'http://localhost:3001,https://shop.planenadler.de,https://adlerplanen.de,https://www.adlerplanen.de');

// Optional explicit gateway preference:
define('WC_KLARNA_ADD_PAYMENT_GATEWAY_ID', 'stripe_klarna');
define('WC_PAYPAL_ADD_PAYMENT_GATEWAY_ID', 'ppcp');
```

## 3) Health checks

1. `POST /wp-json/planenadler/v1/provider-add-payment-method` with missing signature must return `401`.
2. Signed request with wrong provider host must return `502` and never return `ogp.me`.
3. Valid signed Klarna request should return:

```json
{
  "success": true,
  "provider": "klarna",
  "gatewayId": "stripe_klarna",
  "redirectUrl": "https://pm-redirects.stripe.com/..."
}
```

## 4) Important limitation

If WooCommerce gateway itself does not create an external provider redirect (or PayPal vault flow is not active), this endpoint returns deterministic errors (`provider_redirect_not_found` / `gateway_not_available`) with Woo notice details.
