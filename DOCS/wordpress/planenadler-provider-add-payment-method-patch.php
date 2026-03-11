<?php
/**
 * Drop-in patch for /planenadler/v1/provider-add-payment-method
 *
 * Purpose:
 * - Validate signed requests from Next.js
 * - Resolve a real external redirect to Klarna/PayPal only
 * - Avoid false positives like https://ogp.me/ns#
 * - Return deterministic JSON errors if no valid provider redirect exists
 *
 * Usage:
 * 1) Put this file into your plugin, e.g.
 *    wp-content/plugins/planenadler-checkout-provider-api/includes/
 * 2) Load it from your plugin bootstrap and call:
 *    Planenadler_Provider_Add_Payment_Method_Patch::init();
 * 3) Keep your route as:
 *    POST /wp-json/planenadler/v1/provider-add-payment-method
 */

if (!defined('ABSPATH')) {
	exit;
}

if (!class_exists('Planenadler_Provider_Add_Payment_Method_Patch')) {
	final class Planenadler_Provider_Add_Payment_Method_Patch {
		private const ROUTE_NAMESPACE = 'planenadler/v1';
		private const ROUTE_PATH = '/provider-add-payment-method';
		private const SIGNATURE_TTL_SECONDS = 300;
		private const REPLAY_TTL_SECONDS = 600;
		private const REQUEST_TIMEOUT_SECONDS = 25;
		private const MAX_REDIRECT_HOPS = 6;

		public static function init(): void {
			add_action('rest_api_init', array(__CLASS__, 'register_routes'));
		}

		public static function register_routes(): void {
			register_rest_route(
				self::ROUTE_NAMESPACE,
				self::ROUTE_PATH,
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array(__CLASS__, 'handle'),
					'permission_callback' => '__return_true',
				)
			);
		}

		public static function handle(WP_REST_Request $request): WP_REST_Response {
			if (!class_exists('WooCommerce') || !function_exists('wc_get_account_endpoint_url')) {
				return self::error_response('woocommerce_not_available', 'WooCommerce is not available.', 500);
			}

			$raw_body = (string) $request->get_body();
			$payload  = json_decode($raw_body, true);
			if (!is_array($payload)) {
				return self::error_response('invalid_json', 'Request body must be valid JSON.', 400);
			}

			$signature_check = self::validate_request_signature($request, $raw_body);
			if (is_wp_error($signature_check)) {
				$status = (int) $signature_check->get_error_data('status');
				if ($status <= 0) {
					$status = 401;
				}
				return self::error_response(
					$signature_check->get_error_code(),
					$signature_check->get_error_message(),
					$status
				);
			}

			$provider = isset($payload['provider']) ? sanitize_key((string) $payload['provider']) : '';
			if (!in_array($provider, array('klarna', 'paypal'), true)) {
				return self::error_response('invalid_provider', 'Provider must be klarna or paypal.', 400);
			}

			$customer_email = isset($payload['customerEmail']) ? sanitize_email((string) $payload['customerEmail']) : '';
			$customer_id    = isset($payload['customerId']) ? absint($payload['customerId']) : 0;

			if (empty($customer_email)) {
				return self::error_response('missing_customer_email', 'customerEmail is required for signed requests.', 401);
			}

			if ($customer_id <= 0) {
				return self::error_response('missing_customer_id', 'customerId is required for signed requests.', 401);
			}

			$user = get_user_by('email', $customer_email);
			if (!$user instanceof WP_User) {
				return self::error_response('user_not_found', 'No WordPress user found for customerEmail.', 404);
			}

			if ((int) $user->ID !== $customer_id) {
				return self::error_response('customer_mismatch', 'customerEmail and customerId do not match.', 403);
			}

			$rate_limit_check = self::enforce_rate_limit((int) $user->ID, $provider);
			if (is_wp_error($rate_limit_check)) {
				$status = (int) $rate_limit_check->get_error_data('status');
				if ($status <= 0) {
					$status = 429;
				}
				return self::error_response(
					$rate_limit_check->get_error_code(),
					$rate_limit_check->get_error_message(),
					$status
				);
			}

			$return_url = isset($payload['returnUrl']) ? trim((string) $payload['returnUrl']) : '';
			$return_url_validation = self::validate_return_url($return_url);
			if (is_wp_error($return_url_validation)) {
				$status = (int) $return_url_validation->get_error_data('status');
				if ($status <= 0) {
					$status = 400;
				}
				return self::error_response(
					$return_url_validation->get_error_code(),
					$return_url_validation->get_error_message(),
					$status
				);
			}
			$return_url = (string) $return_url_validation;

			$available_gateway_ids = self::get_available_gateway_ids();
			$gateway_id = self::resolve_gateway_id($provider, $available_gateway_ids);
			if (empty($gateway_id)) {
				return self::error_response(
					'gateway_not_available',
					'No enabled gateway found for provider.',
					422,
					array(
						'availableGatewayIds' => $available_gateway_ids,
					)
				);
			}

			$add_payment_url = self::build_add_payment_method_url($gateway_id, $return_url);
			if (empty($add_payment_url)) {
				return self::error_response('invalid_add_payment_url', 'Could not build add-payment-method URL.', 500);
			}

			$cookie_header = self::build_logged_in_cookie_header((int) $user->ID);
			if (empty($cookie_header)) {
				return self::error_response('cookie_generation_failed', 'Could not generate WordPress session cookie.', 500);
			}

			$page_response = self::http_request('GET', $add_payment_url, $cookie_header, '');
			if (is_wp_error($page_response)) {
				return self::error_response('upstream_get_failed', $page_response->get_error_message(), 502);
			}

			$redirect_from_page = self::extract_provider_redirect_from_response($page_response, $provider, $cookie_header);
			if (!empty($redirect_from_page['url'])) {
				return self::success_response($provider, $gateway_id, $redirect_from_page['url']);
			}

			if (!empty($redirect_from_page['error'])) {
				// Continue only when still on internal add-payment page and nonce can be posted.
				// Otherwise return deterministic upstream reason.
				if (!empty($redirect_from_page['fatal'])) {
					return self::error_response(
						'invalid_provider_redirect',
						(string) $redirect_from_page['error'],
						502,
						array(
							'gatewayId'   => $gateway_id,
							'addPaymentUrl' => $add_payment_url,
						)
					);
				}
			}

			$page_html = isset($page_response['body']) ? (string) $page_response['body'] : '';
			if (self::is_login_page($page_html)) {
				return self::error_response(
					'wp_login_required',
					'WordPress login session could not be established for add-payment-method.',
					401,
					array('addPaymentUrl' => $add_payment_url)
				);
			}

			$direct_gateway_error = '';
			$direct_gateway_result = self::attempt_direct_gateway_redirect(
				$provider,
				$gateway_id,
				$page_html,
				$cookie_header,
				$user,
				$return_url
			);
			if (is_wp_error($direct_gateway_result)) {
				$direct_gateway_error = $direct_gateway_result->get_error_message();
			} elseif (!empty($direct_gateway_result['url'])) {
				return self::success_response($provider, $gateway_id, (string) $direct_gateway_result['url']);
			}

			$nonce = self::extract_input_value($page_html, 'woocommerce-add-payment-method-nonce');
			if (empty($nonce)) {
				$wp_notice = self::extract_woocommerce_notice($page_html);
				return self::error_response(
					'missing_add_payment_nonce',
					empty($wp_notice) ? 'Could not extract WooCommerce add-payment nonce.' : $wp_notice,
					502,
					array(
						'gatewayId'   => $gateway_id,
						'addPaymentUrl' => $add_payment_url,
					)
				);
			}

			$form_action = self::extract_form_action($page_html);
			$action_url  = self::resolve_url($form_action, $add_payment_url);
			if (empty($action_url)) {
				$action_url = $add_payment_url;
			}

			$http_referer = self::extract_input_value($page_html, '_wp_http_referer');
			if (empty($http_referer)) {
				$parsed_add = wp_parse_url($add_payment_url);
				$path       = isset($parsed_add['path']) ? (string) $parsed_add['path'] : '/';
				$query      = isset($parsed_add['query']) ? (string) $parsed_add['query'] : '';
				$http_referer = empty($query) ? $path : $path . '?' . $query;
			}

			$post_fields = array(
				'payment_method'                       => $gateway_id,
				'woocommerce-add-payment-method-nonce' => $nonce,
				'_wp_http_referer'                     => $http_referer,
				'woocommerce_add_payment_method'       => '1',
			);
			if (!empty($return_url)) {
				$post_fields['return_url'] = $return_url;
			}

			$submit_response = self::http_request(
				'POST',
				$action_url,
				$cookie_header,
				http_build_query($post_fields, '', '&')
			);

			if (is_wp_error($submit_response)) {
				return self::error_response('upstream_post_failed', $submit_response->get_error_message(), 502);
			}

			$redirect_from_submit = self::extract_provider_redirect_from_response($submit_response, $provider, $cookie_header);
			if (!empty($redirect_from_submit['url'])) {
				return self::success_response($provider, $gateway_id, $redirect_from_submit['url']);
			}

			$submit_html = isset($submit_response['body']) ? (string) $submit_response['body'] : '';
			$wp_notice   = self::extract_woocommerce_notice($submit_html);
			if (empty($wp_notice) && !empty($redirect_from_submit['error'])) {
				$wp_notice = (string) $redirect_from_submit['error'];
			}
			if (empty($wp_notice) && !empty($direct_gateway_error)) {
				$wp_notice = $direct_gateway_error;
			}
			if (empty($wp_notice)) {
				$wp_notice = 'No external Klarna/PayPal redirect URL found.';
			}

			return self::error_response(
				'provider_redirect_not_found',
				$wp_notice,
				502,
				array(
					'gatewayId'           => $gateway_id,
					'availableGatewayIds' => $available_gateway_ids,
					'addPaymentUrl'       => $add_payment_url,
				)
			);
		}

		private static function success_response(string $provider, string $gateway_id, string $redirect_url): WP_REST_Response {
			return new WP_REST_Response(
				array(
					'success'     => true,
					'provider'    => $provider,
					'gatewayId'   => $gateway_id,
					'redirectUrl' => $redirect_url,
				),
				200
			);
		}

		private static function error_response(string $code, string $message, int $status, array $extra = array()): WP_REST_Response {
			$payload = array_merge(
				array(
					'success' => false,
					'code'    => $code,
					'error'   => $message,
				),
				$extra
			);
			return new WP_REST_Response($payload, $status);
		}

		private static function validate_request_signature(WP_REST_Request $request, string $raw_body) {
			$secret = self::get_api_secret();

			if (empty($secret)) {
				return new WP_Error(
					'missing_api_secret',
					'Provider API secret is not configured in wp-config.php.',
					array('status' => 500)
				);
			}

			$timestamp = (string) $request->get_header('x-planenadler-timestamp');
			$signature = (string) $request->get_header('x-planenadler-signature');
			if (empty($timestamp) || empty($signature)) {
				return new WP_Error(
					'missing_signature_headers',
					'X-Planenadler-Timestamp and X-Planenadler-Signature are required.',
					array('status' => 401)
				);
			}

			if (!ctype_digit($timestamp)) {
				return new WP_Error('invalid_signature_timestamp', 'Signature timestamp is invalid.', array('status' => 401));
			}

			$ts = (int) $timestamp;
			if (abs(time() - $ts) > self::SIGNATURE_TTL_SECONDS) {
				return new WP_Error('expired_signature', 'Signature timestamp is expired.', array('status' => 401));
			}

			$expected = hash_hmac('sha256', $timestamp . '.' . $raw_body, $secret);
			if (!hash_equals($expected, $signature)) {
				return new WP_Error('invalid_signature', 'Signature verification failed.', array('status' => 401));
			}

			$replay_key = 'pn_sig_' . hash('sha256', $timestamp . '|' . $signature);
			if (get_transient($replay_key)) {
				return new WP_Error('replay_detected', 'Replay detected for this signed request.', array('status' => 409));
			}
			set_transient($replay_key, 1, self::REPLAY_TTL_SECONDS);

			return true;
		}

		private static function get_api_secret(): string {
			if (defined('WC_PROVIDER_API_SECRET') && WC_PROVIDER_API_SECRET) {
				return (string) WC_PROVIDER_API_SECRET;
			}
			if (defined('PLANENADLER_PROVIDER_API_SECRET') && PLANENADLER_PROVIDER_API_SECRET) {
				return (string) PLANENADLER_PROVIDER_API_SECRET;
			}
			if (!empty($_ENV['WC_PROVIDER_API_SECRET'])) {
				return (string) $_ENV['WC_PROVIDER_API_SECRET'];
			}
			if (!empty($_ENV['PLANENADLER_PROVIDER_API_SECRET'])) {
				return (string) $_ENV['PLANENADLER_PROVIDER_API_SECRET'];
			}
			return '';
		}

		private static function enforce_rate_limit(int $user_id, string $provider) {
			$rate_key = 'pn_rl_' . md5($user_id . '|' . $provider);
			if (get_transient($rate_key)) {
				return new WP_Error(
					'rate_limited',
					'Too many add-payment requests. Please wait a few seconds.',
					array('status' => 429)
				);
			}
			set_transient($rate_key, 1, 8);
			return true;
		}

		private static function validate_return_url(string $return_url) {
			if (empty($return_url)) {
				return '';
			}

			$parts = wp_parse_url($return_url);
			if (empty($parts['scheme']) || empty($parts['host'])) {
				return new WP_Error('invalid_return_url', 'returnUrl must contain scheme and host.', array('status' => 400));
			}

			$scheme = strtolower((string) $parts['scheme']);
			$host = strtolower((string) $parts['host']);
			if (!in_array($scheme, array('https', 'http'), true)) {
				return new WP_Error('invalid_return_url', 'returnUrl must use http or https.', array('status' => 400));
			}

			if ($scheme !== 'https' && !self::is_localhost_host($host)) {
				return new WP_Error(
					'insecure_return_url',
					'returnUrl must use https (except localhost for development).',
					array('status' => 400)
				);
			}

			$origin = strtolower($parts['scheme']) . '://' . strtolower($parts['host']);
			if (!empty($parts['port'])) {
				$origin .= ':' . (int) $parts['port'];
			}

			$allowed_origins = self::get_allowed_return_origins();
			if (!in_array($origin, $allowed_origins, true)) {
				return new WP_Error('return_url_origin_not_allowed', 'returnUrl origin is not allowed.', array('status' => 400));
			}

			return (string) $return_url;
		}

		private static function is_localhost_host(string $host): bool {
			$normalized = strtolower(trim($host));
			return in_array($normalized, array('localhost', '127.0.0.1', '::1', '[::1]'), true);
		}

		private static function get_allowed_return_origins(): array {
			$origins = array();

			if (defined('WC_PROVIDER_ALLOWED_RETURN_ORIGINS')) {
				$raw = (string) WC_PROVIDER_ALLOWED_RETURN_ORIGINS;
				$list = array_filter(array_map('trim', explode(',', $raw)));
				foreach ($list as $item) {
					$item_parts = wp_parse_url($item);
					if (empty($item_parts['scheme']) || empty($item_parts['host'])) {
						continue;
					}
					$origin = strtolower($item_parts['scheme']) . '://' . strtolower($item_parts['host']);
					if (!empty($item_parts['port'])) {
						$origin .= ':' . (int) $item_parts['port'];
					}
					$origins[] = $origin;
				}
			}

			$home_parts = wp_parse_url(home_url('/'));
			if (!empty($home_parts['scheme']) && !empty($home_parts['host'])) {
				$origin = strtolower($home_parts['scheme']) . '://' . strtolower($home_parts['host']);
				if (!empty($home_parts['port'])) {
					$origin .= ':' . (int) $home_parts['port'];
				}
				$origins[] = $origin;
			}

			return array_values(array_unique($origins));
		}

		private static function get_available_gateway_ids(): array {
			if (!function_exists('WC') || !WC()) {
				return array();
			}
			if (!WC()->payment_gateways()) {
				return array();
			}

			$gateways = WC()->payment_gateways()->payment_gateways();
			if (!is_array($gateways)) {
				return array();
			}

			$enabled_ids = array();
			foreach ($gateways as $gateway_id => $gateway) {
				$enabled = isset($gateway->enabled) ? (string) $gateway->enabled : 'no';
				if ($enabled === 'yes') {
					$enabled_ids[] = (string) $gateway_id;
				}
			}

			return array_values(array_unique($enabled_ids));
		}

		private static function resolve_gateway_id(string $provider, array $available_gateway_ids): string {
			$env_key = $provider === 'klarna' ? 'WC_KLARNA_ADD_PAYMENT_GATEWAY_ID' : 'WC_PAYPAL_ADD_PAYMENT_GATEWAY_ID';
			$preferred = '';
			if (defined($env_key)) {
				$preferred = sanitize_key((string) constant($env_key));
			}

			$candidates = array();
			if (!empty($preferred)) {
				$candidates[] = $preferred;
			}

			if ($provider === 'klarna') {
				$candidates = array_merge(
					$candidates,
					array(
						'stripe_klarna',
						'woocommerce_payments_klarna',
						'klarna_payments',
						'klarna',
						'woocommerce_payments',
						'stripe',
					)
				);
			} else {
				$candidates = array_merge(
					$candidates,
					array(
						'ppcp-gateway',
						'ppcp',
						'paypal',
						'paypal_express',
					)
				);
			}

			$candidates = array_values(array_unique(array_filter(array_map('sanitize_key', $candidates))));
			if (empty($available_gateway_ids)) {
				return !empty($candidates) ? $candidates[0] : '';
			}

			$available_lower = array();
			foreach ($available_gateway_ids as $id) {
				$available_lower[strtolower((string) $id)] = (string) $id;
			}

			foreach ($candidates as $candidate) {
				$key = strtolower($candidate);
				if (isset($available_lower[$key])) {
					return $available_lower[$key];
				}
			}

			foreach ($available_lower as $lower => $original) {
				if (strpos($lower, $provider) !== false) {
					return $original;
				}
			}

			return '';
		}

		private static function build_add_payment_method_url(string $gateway_id, string $return_url): string {
			$url = wc_get_account_endpoint_url('add-payment-method');
			if (empty($url)) {
				return '';
			}
			$url = add_query_arg('payment_method', rawurlencode($gateway_id), $url);
			if (!empty($return_url)) {
				$url = add_query_arg('return_url', $return_url, $url);
			}
			return (string) $url;
		}

		private static function build_logged_in_cookie_header(int $user_id): string {
			if ($user_id <= 0 || !defined('COOKIEHASH')) {
				return '';
			}

			$expires     = time() + (5 * MINUTE_IN_SECONDS);
			$cookie_name = 'wordpress_logged_in_' . COOKIEHASH;
			$cookie_val  = wp_generate_auth_cookie($user_id, $expires, 'logged_in');
			if (empty($cookie_val)) {
				return '';
			}

			return $cookie_name . '=' . $cookie_val;
		}

		private static function http_request(string $method, string $url, string $cookie_header, string $body) {
			$args = array(
				'method'      => strtoupper($method),
				'timeout'     => self::REQUEST_TIMEOUT_SECONDS,
				'redirection' => 0,
				'sslverify'   => true,
				'headers'     => array(
					'Cookie'      => $cookie_header,
					'Content-Type' => 'application/x-www-form-urlencoded',
				),
			);

			if (strtoupper($method) === 'POST') {
				$args['body'] = $body;
			} else {
				unset($args['headers']['Content-Type']);
			}

			$response = wp_remote_request($url, $args);
			if (is_wp_error($response)) {
				return $response;
			}

			return array(
				'status'  => (int) wp_remote_retrieve_response_code($response),
				'body'    => (string) wp_remote_retrieve_body($response),
				'headers' => wp_remote_retrieve_headers($response),
				'url'     => $url,
			);
		}

		private static function extract_provider_redirect_from_response(array $response, string $provider, string $cookie_header): array {
			$status = isset($response['status']) ? (int) $response['status'] : 0;
			$headers = isset($response['headers']) ? $response['headers'] : array();
			$body = isset($response['body']) ? (string) $response['body'] : '';
			$current_url = isset($response['url']) ? (string) $response['url'] : home_url('/');

			$location = '';
			if ($headers instanceof Requests_Utility_CaseInsensitiveDictionary) {
				$location = (string) $headers->offsetGet('location');
			} elseif (is_array($headers) && isset($headers['location'])) {
				$location = (string) $headers['location'];
			}

			if ($status >= 300 && $status <= 399 && !empty($location)) {
				$next = self::resolve_url($location, $current_url);
				if (empty($next)) {
					return array('error' => 'Received redirect without valid location URL.', 'fatal' => true);
				}
				return self::follow_redirect_chain($next, $provider, $cookie_header, self::MAX_REDIRECT_HOPS);
			}

			$html_redirect = self::extract_provider_url_from_html($body, $provider);
			if (!empty($html_redirect)) {
				return array('url' => $html_redirect);
			}

			return array();
		}

		private static function follow_redirect_chain(string $start_url, string $provider, string $cookie_header, int $max_hops): array {
			$current_url = $start_url;
			$site_origin = self::get_origin(home_url('/'));

			for ($i = 0; $i < $max_hops; $i++) {
				if (self::is_trusted_provider_url($current_url, $provider)) {
					return array('url' => $current_url);
				}

				$current_origin = self::get_origin($current_url);
				if (!empty($site_origin) && !empty($current_origin) && $current_origin !== $site_origin) {
					return array('error' => 'Redirect target is external but not trusted for provider.', 'fatal' => true);
				}

				$response = self::http_request('GET', $current_url, $cookie_header, '');
				if (is_wp_error($response)) {
					return array('error' => $response->get_error_message(), 'fatal' => true);
				}

				$status = isset($response['status']) ? (int) $response['status'] : 0;
				$body   = isset($response['body']) ? (string) $response['body'] : '';
				$headers = isset($response['headers']) ? $response['headers'] : array();

				$location = '';
				if ($headers instanceof Requests_Utility_CaseInsensitiveDictionary) {
					$location = (string) $headers->offsetGet('location');
				} elseif (is_array($headers) && isset($headers['location'])) {
					$location = (string) $headers['location'];
				}

				if ($status >= 300 && $status <= 399 && !empty($location)) {
					$next_url = self::resolve_url($location, $current_url);
					if (empty($next_url)) {
						return array('error' => 'Invalid redirect location encountered.', 'fatal' => true);
					}
					$current_url = $next_url;
					continue;
				}

				$html_redirect = self::extract_provider_url_from_html($body, $provider);
				if (!empty($html_redirect)) {
					return array('url' => $html_redirect);
				}

				$notice = self::extract_woocommerce_notice($body);
				if (!empty($notice)) {
					return array('error' => $notice, 'fatal' => false);
				}

				return array('error' => 'No external provider redirect found after internal redirects.', 'fatal' => false);
			}

			return array('error' => 'Too many redirects while resolving provider URL.', 'fatal' => true);
		}

		private static function resolve_url(string $target, string $base_url): string {
			$target = trim($target);
			if ($target === '') {
				return '';
			}

			$target = html_entity_decode($target, ENT_QUOTES | ENT_HTML5, 'UTF-8');

			if (preg_match('#^https?://#i', $target)) {
				return (string) $target;
			}

			$base = wp_parse_url($base_url);
			if (!$base || empty($base['scheme']) || empty($base['host'])) {
				return '';
			}

			$scheme = (string) $base['scheme'];
			$host   = (string) $base['host'];
			$port   = isset($base['port']) ? ':' . (int) $base['port'] : '';

			if (strpos($target, '//') === 0) {
				return $scheme . ':' . $target;
			}

			if (strpos($target, '/') === 0) {
				return $scheme . '://' . $host . $port . $target;
			}

			$base_path = isset($base['path']) ? (string) $base['path'] : '/';
			$dir       = preg_replace('#/[^/]*$#', '/', $base_path);
			$path      = $dir . $target;

			return $scheme . '://' . $host . $port . $path;
		}

		private static function extract_provider_url_from_html(string $html, string $provider): string {
			if ($html === '') {
				return '';
			}
			$decoded = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
			$candidates = array();

			if (preg_match('/(?:window\.)?location(?:\.href)?\s*=\s*["\'](https?:\/\/[^"\']+)["\']/i', $decoded, $m)) {
				$candidates[] = $m[1];
			}
			if (preg_match('/location\.replace\(\s*["\'](https?:\/\/[^"\']+)["\']\s*\)/i', $decoded, $m)) {
				$candidates[] = $m[1];
			}

			if (preg_match_all('/<form[^>]*action=["\'](https?:\/\/[^"\']+)["\'][^>]*>/i', $decoded, $form_matches)) {
				if (!empty($form_matches[1]) && is_array($form_matches[1])) {
					$candidates = array_merge($candidates, $form_matches[1]);
				}
			}

			$candidates = array_values(array_unique(array_filter(array_map('trim', $candidates))));
			foreach ($candidates as $url) {
				if (self::is_trusted_provider_url($url, $provider)) {
					return $url;
				}
			}

			return '';
		}

		private static function is_trusted_provider_url(string $url, string $provider): bool {
			$parts = wp_parse_url($url);
			if (!$parts || empty($parts['host']) || empty($parts['scheme'])) {
				return false;
			}

			$scheme = strtolower((string) $parts['scheme']);
			if ($scheme !== 'https') {
				return false;
			}

			$host = strtolower((string) $parts['host']);
			$allowed_hosts = $provider === 'klarna'
				? array('klarna.com', 'klarnaevt.com', 'pm-redirects.stripe.com')
				: array('paypal.com', 'paypalobjects.com');

			foreach ($allowed_hosts as $allowed_host) {
				$allowed_host = strtolower($allowed_host);
				if ($host === $allowed_host) {
					return true;
				}
				if (substr($host, -strlen('.' . $allowed_host)) === '.' . $allowed_host) {
					return true;
				}
			}

			return false;
		}

		private static function attempt_direct_gateway_redirect(
			string $provider,
			string $gateway_id,
			string $page_html,
			string $cookie_header,
			WP_User $user,
			string $return_url
		) {
			if ($provider !== 'klarna') {
				return array();
			}

			if (!self::is_stripe_klarna_gateway($gateway_id)) {
				return array();
			}

			$result = self::attempt_stripe_klarna_redirect($page_html, $cookie_header, $user, $return_url);
			if (is_wp_error($result)) {
				return $result;
			}

			if (!empty($result['url']) && self::is_trusted_provider_url((string) $result['url'], $provider)) {
				return $result;
			}

			if (!empty($result['url'])) {
				return new WP_Error(
					'invalid_provider_redirect',
					'Received untrusted external redirect URL from Stripe Klarna flow.'
				);
			}

			return array();
		}

		private static function is_stripe_klarna_gateway(string $gateway_id): bool {
			$lower = strtolower(trim($gateway_id));
			if ($lower === 'stripe_klarna') {
				return true;
			}
			return strpos($lower, 'stripe') !== false && strpos($lower, 'klarna') !== false;
		}

		private static function attempt_stripe_klarna_redirect(
			string $page_html,
			string $cookie_header,
			WP_User $user,
			string $return_url
		) {
			$stripe_params = self::extract_wc_stripe_upe_params($page_html);
			if (empty($stripe_params)) {
				return new WP_Error(
					'stripe_upe_params_missing',
					'Stripe UPE parameters not found on add-payment page.'
				);
			}

			$publishable_key = isset($stripe_params['key']) ? trim((string) $stripe_params['key']) : '';
			$nonce = isset($stripe_params['createAndConfirmSetupIntentNonce'])
				? (string) $stripe_params['createAndConfirmSetupIntentNonce']
				: '';
			$ajax_url = isset($stripe_params['wp_ajax_url'])
				? self::resolve_url((string) $stripe_params['wp_ajax_url'], home_url('/'))
				: '';

			if (empty($publishable_key) || strpos($publishable_key, 'pk_') !== 0) {
				return new WP_Error(
					'stripe_publishable_key_missing',
					'Stripe publishable key missing in wc_stripe_upe_params.'
				);
			}
			if (empty($nonce)) {
				return new WP_Error(
					'stripe_setup_nonce_missing',
					'Stripe setup nonce missing in wc_stripe_upe_params.'
				);
			}
			if (empty($ajax_url)) {
				return new WP_Error(
					'stripe_ajax_url_missing',
					'Stripe AJAX endpoint (wp_ajax_url) is missing.'
				);
			}

			$billing = self::build_stripe_billing_details($user);
			$payment_method = self::create_stripe_klarna_payment_method($publishable_key, $billing);
			if (is_wp_error($payment_method)) {
				return $payment_method;
			}

			$post_fields = array(
				'action'                    => 'wc_stripe_create_and_confirm_setup_intent',
				'wc-stripe-payment-method'  => (string) $payment_method,
				'wc-stripe-payment-type'    => 'klarna',
				'_ajax_nonce'               => $nonce,
			);
			if (!empty($return_url)) {
				$post_fields['return_url'] = $return_url;
			}

			$confirm_response = self::http_request(
				'POST',
				$ajax_url,
				$cookie_header,
				http_build_query($post_fields, '', '&')
			);
			if (is_wp_error($confirm_response)) {
				return new WP_Error('stripe_setup_intent_request_failed', $confirm_response->get_error_message());
			}

			$body = isset($confirm_response['body']) ? (string) $confirm_response['body'] : '';
			$decoded = json_decode($body, true);
			if (!is_array($decoded)) {
				return new WP_Error(
					'stripe_setup_intent_invalid_json',
					'Stripe setup intent response is not valid JSON.'
				);
			}

			$data = (isset($decoded['data']) && is_array($decoded['data'])) ? $decoded['data'] : array();
			if (empty($decoded['success'])) {
				$error_message = '';
				if (!empty($data['error']) && is_array($data['error']) && !empty($data['error']['message'])) {
					$error_message = (string) $data['error']['message'];
				} elseif (!empty($data['error']) && is_string($data['error'])) {
					$error_message = $data['error'];
				}
				if (empty($error_message)) {
					$error_message = 'Stripe setup intent confirmation failed.';
				}
				return new WP_Error('stripe_setup_intent_failed', $error_message);
			}

			$redirect_url = '';
			if (
				!empty($data['next_action']) &&
				is_array($data['next_action']) &&
				!empty($data['next_action']['redirect_to_url']) &&
				is_array($data['next_action']['redirect_to_url']) &&
				!empty($data['next_action']['redirect_to_url']['url'])
			) {
				$redirect_url = (string) $data['next_action']['redirect_to_url']['url'];
			}

			if ($redirect_url !== '') {
				return array('url' => $redirect_url);
			}

			return new WP_Error(
				'stripe_setup_intent_no_redirect',
				'Stripe setup intent returned no external redirect URL.'
			);
		}

		private static function extract_wc_stripe_upe_params(string $html): array {
			if ($html === '') {
				return array();
			}

			if (!preg_match('/var\s+wc_stripe_upe_params\s*=\s*(\{.*?\});/s', $html, $m)) {
				return array();
			}

			$json = html_entity_decode((string) $m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
			$decoded = json_decode($json, true);
			if (!is_array($decoded)) {
				return array();
			}

			return $decoded;
		}

		private static function build_stripe_billing_details(WP_User $user): array {
			$user_id = (int) $user->ID;
			$customer = class_exists('WC_Customer') ? new WC_Customer($user_id) : null;

			$first_name = '';
			$last_name = '';
			$email = sanitize_email((string) $user->user_email);
			$phone = '';
			$country = 'DE';
			$line1 = '';
			$line2 = '';
			$city = '';
			$state = '';
			$postcode = '';

			if ($customer instanceof WC_Customer) {
				$first_name = (string) $customer->get_billing_first_name();
				$last_name = (string) $customer->get_billing_last_name();
				$email = sanitize_email((string) $customer->get_billing_email()) ?: $email;
				$phone = (string) $customer->get_billing_phone();
				$country = (string) $customer->get_billing_country();
				$line1 = (string) $customer->get_billing_address_1();
				$line2 = (string) $customer->get_billing_address_2();
				$city = (string) $customer->get_billing_city();
				$state = (string) $customer->get_billing_state();
				$postcode = (string) $customer->get_billing_postcode();
			}

			if ($first_name === '') {
				$first_name = (string) $user->first_name;
			}
			if ($last_name === '') {
				$last_name = (string) $user->last_name;
			}

			$name = trim($first_name . ' ' . $last_name);
			if ($name === '') {
				$name = trim((string) $user->display_name);
			}
			if ($name === '') {
				$name = $email;
			}
			if ($country === '') {
				$country = 'DE';
			}

			return array(
				'name'    => $name,
				'email'   => $email,
				'phone'   => $phone,
				'address' => array(
					'country'     => strtoupper($country),
					'line1'       => $line1,
					'line2'       => $line2,
					'city'        => $city,
					'state'       => $state,
					'postal_code' => $postcode,
				),
			);
		}

		private static function create_stripe_klarna_payment_method(string $publishable_key, array $billing) {
			$body = array(
				'type'                         => 'klarna',
				'billing_details[name]'        => isset($billing['name']) ? (string) $billing['name'] : '',
				'billing_details[email]'       => isset($billing['email']) ? (string) $billing['email'] : '',
				'billing_details[phone]'       => isset($billing['phone']) ? (string) $billing['phone'] : '',
				'billing_details[address][country]' => isset($billing['address']['country']) ? (string) $billing['address']['country'] : 'DE',
			);

			$optional_address_fields = array(
				'line1'       => 'billing_details[address][line1]',
				'line2'       => 'billing_details[address][line2]',
				'city'        => 'billing_details[address][city]',
				'state'       => 'billing_details[address][state]',
				'postal_code' => 'billing_details[address][postal_code]',
			);
			foreach ($optional_address_fields as $source_key => $target_key) {
				$value = isset($billing['address'][$source_key]) ? trim((string) $billing['address'][$source_key]) : '';
				if ($value !== '') {
					$body[$target_key] = $value;
				}
			}

			$response = wp_remote_post(
				'https://api.stripe.com/v1/payment_methods',
				array(
					'timeout'     => self::REQUEST_TIMEOUT_SECONDS,
					'redirection' => 0,
					'sslverify'   => true,
					'headers'     => array(
						'Authorization' => 'Basic ' . base64_encode($publishable_key . ':'),
						'Content-Type'  => 'application/x-www-form-urlencoded',
					),
					'body'        => http_build_query($body, '', '&'),
				)
			);

			if (is_wp_error($response)) {
				return new WP_Error('stripe_payment_method_request_failed', $response->get_error_message());
			}

			$status = (int) wp_remote_retrieve_response_code($response);
			$raw = (string) wp_remote_retrieve_body($response);
			$decoded = json_decode($raw, true);

			if ($status < 200 || $status >= 300 || !is_array($decoded) || empty($decoded['id'])) {
				$error_message = 'Unable to create Stripe Klarna payment method.';
				if (is_array($decoded) && !empty($decoded['error']) && is_array($decoded['error']) && !empty($decoded['error']['message'])) {
					$error_message = (string) $decoded['error']['message'];
				}
				return new WP_Error('stripe_payment_method_failed', $error_message);
			}

			return (string) $decoded['id'];
		}

		private static function is_login_page(string $html): bool {
			return (bool) preg_match('/id=["\']customer_login["\']/i', $html)
				|| (bool) preg_match('/name=["\']woocommerce-login-nonce["\']/i', $html);
		}

		private static function extract_input_value(string $html, string $input_name): string {
			$pattern = '/<input[^>]*name=["\']' . preg_quote($input_name, '/') . '["\'][^>]*>/i';
			if (!preg_match($pattern, $html, $m)) {
				return '';
			}
			if (preg_match('/value=["\']([^"\']*)["\']/i', $m[0], $v)) {
				return html_entity_decode((string) $v[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
			}
			return '';
		}

		private static function extract_form_action(string $html): string {
			if (preg_match('/<form[^>]*id=["\']add_payment_method["\'][^>]*action=["\']([^"\']+)["\']/i', $html, $m)) {
				return html_entity_decode((string) $m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
			}
			if (preg_match('/<form[^>]*class=["\'][^"\']*woocommerce-AddPaymentMethod-form[^"\']*["\'][^>]*action=["\']([^"\']+)["\']/i', $html, $m)) {
				return html_entity_decode((string) $m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8');
			}
			return '';
		}

		private static function extract_woocommerce_notice(string $html): string {
			$patterns = array(
				'/<ul[^>]*class=["\'][^"\']*woocommerce-error[^"\']*["\'][^>]*>[\s\S]*?<\/ul>/i',
				'/<div[^>]*class=["\'][^"\']*woocommerce-error[^"\']*["\'][^>]*>[\s\S]*?<\/div>/i',
				'/<div[^>]*class=["\'][^"\']*woocommerce-message[^"\']*["\'][^>]*>[\s\S]*?<\/div>/i',
				'/<div[^>]*class=["\'][^"\']*woocommerce-info[^"\']*["\'][^>]*>[\s\S]*?<\/div>/i',
			);

			foreach ($patterns as $pattern) {
				if (!preg_match($pattern, $html, $m)) {
					continue;
				}
				$text = wp_strip_all_tags(html_entity_decode((string) $m[0], ENT_QUOTES | ENT_HTML5, 'UTF-8'));
				$text = trim(preg_replace('/\s+/', ' ', $text));
				if ($text !== '') {
					return $text;
				}
			}

			return '';
		}

		private static function get_origin(string $url): string {
			$parts = wp_parse_url($url);
			if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
				return '';
			}

			$origin = strtolower((string) $parts['scheme']) . '://' . strtolower((string) $parts['host']);
			if (!empty($parts['port'])) {
				$origin .= ':' . (int) $parts['port'];
			}
			return $origin;
		}
	}
}
