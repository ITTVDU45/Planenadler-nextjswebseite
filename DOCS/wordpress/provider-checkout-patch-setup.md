# Provider Checkout Patch Setup

## Ziel

Der Headless-Checkout fuer PayPal/Klarna sollte **nicht** direkt auf der nackten WooCommerce Store API fuer externe Redirect-Zahlungen enden, sondern ueber einen eigenen WordPress-Endpoint laufen, der:

- `returnUrl` und `cancelUrl` aus Next.js uebernimmt
- den echten Provider-Redirect aus Woo/PayPal extrahiert
- nach erfolgreicher Rueckkehr wieder in die Next.js-App zurueckleitet

## Erwartete Next.js-Konfiguration

In der App ist jetzt vorgesehen, dass `WC_PROVIDER_CHECKOUT_API_URL` auf einen WordPress-Custom-Endpoint zeigt, z. B.:

```env
WC_PROVIDER_CHECKOUT_API_URL=https://wp.planenadler.de/wp-json/planenadler/v1/provider-checkout
WC_PROVIDER_API_SECRET=YOUR_LONG_RANDOM_SECRET
```

Falls `WC_PROVIDER_CHECKOUT_API_URL` **nicht** gesetzt ist, faellt die App fuer PayPal/Klarna weiterhin auf die Store API zurueck. Dann bestimmt das Gateway selbst die Ruecksprung-URL und der Nutzer landet typischerweise wieder auf WordPress.

## Payload aus Next.js

Der Checkout-Proxy sendet jetzt an den WordPress-Endpoint:

- `provider`
- `checkoutInput`
- `returnUrl`
- `cancelUrl`
- `customerEmail` aus Billing
- optional `loggedInCustomerEmail`
- optional `customerId`

## Was der WordPress-Endpoint tun sollte

1. Signed Request aus Next.js validieren
2. WooCommerce-Checkout fuer den gewaehlten Provider vorbereiten
3. `returnUrl` und `cancelUrl` an das Gateway / Checkout-Form uebergeben
4. echten externen Redirect zu PayPal/Klarna zurueckgeben
5. bei Fehlern deterministische JSON-Fehler liefern

## Wichtige PayPal-Pruefpunkte

Wenn Zahlungen bei PayPal erfolgreich sind, Bestellungen in Woo aber auf `Pending payment` bleiben, liegt das in der Regel **nicht** am Next.js-Frontend alleine. Bitte in WordPress pruefen:

1. WooCommerce > Bestellung > Order Notes
   Dort steht meist, ob Zahlung nur autorisiert wurde, Capture fehlt oder der Gateway-Callback nicht ankam.
2. WooCommerce > Status > Logs
   Relevante PayPal-Payments-Logs fuer den betroffenen Zeitpunkt ansehen.
3. WooCommerce PayPal Payments Einstellungen
   Pruefen, ob `Authorize only` statt sofortigem Capture aktiv ist.
4. Webhooks / Callback-Kommunikation
   Wenn PayPal bezahlt ist, Woo aber nicht auf `processing` / `completed` springt, sind haeufig Webhooks oder serverseitige Rueckmeldungen die Ursache.

## Erwartetes Symptom bei fehlendem Patch

Wenn der Custom-Endpoint fehlt oder `returnUrl` nicht verwendet:

- Ruecksprung auf `wp.planenadler.de`
- Woo zeigt `Payment gateway is unavailable`
- Bestellung bleibt in `Pending payment`
- Headless-Thank-you-Flow wird nicht sauber erreicht
