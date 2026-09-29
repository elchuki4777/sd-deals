# SD Deals Supabase setup

## 1. Environment and persistence

Create `.env.local` in the project root (never commit it):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLIC_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In Supabase's newer key dashboard, the **publishable key** may be used in `NEXT_PUBLIC_SUPABASE_ANON_KEY`; older projects call it the `anon` key. These are public browser keys, protected by RLS. Never use `service_role`, a secret key, OAuth client secret, or private provider key in a `NEXT_PUBLIC_*` variable. The client persists sessions in browser storage and uses PKCE for OAuth/email links.

Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS storefront origin in production, and add that origin/path in Supabase Auth URL configuration. The client currently builds OAuth and reset URLs from the browser's current origin so local preview and deployed hosts work without hardcoded credentials.

## 2. Apply SQL migrations (in this order)

In Supabase Dashboard → SQL Editor, run the files in this exact order:

1. `schema.sql` — existing PC appointments, quotes and build timeline.
2. `store-schema.sql` — catalog, orders, inventory, reviews, storage, store RLS.
3. `account-security.sql` — customer profiles, addresses, favorites, PC build/order status events, ownership columns, owner-bound RPC and hardened account RLS.

`account-security.sql` intentionally expects the first two schemas to exist. It backfills `user_id` from legacy `customer_id` columns and order ownership; inspect legacy rows before running in production. Back up production data before schema changes.

### Tables and RLS

The account migration protects `profiles`, `addresses`, `favorites`, `orders`, `order_items`, `appointments`, `quotes`, `pc_builds`, `build_events`, `order_events`, `messages`, `invoices`, `saved_products`, and `customer_profiles`. Customer SELECT/INSERT/UPDATE/DELETE policies are scoped to `(select auth.uid())`; privileged writes and wider customer visibility require `public.store_is_admin()`, which trusts only the server-issued `app_metadata.role = 'admin'` claim. The account client also adds explicit `.eq('user_id', auth.uid())` filters, but RLS is the security boundary. Orders are created only by the transactional `place_store_order` RPC; customers cannot insert or rewrite order totals/items, order timeline events are trigger-generated, build records are generated only after appointment confirmation, quote decisions go through `respond_to_quote`, and saved addresses are written through `save_customer_address`. Avatar uploads use the private `profile-avatars` bucket and user-specific storage paths. All other previously configured storage rules remain in effect.

Never grant admin via `user_metadata`, a customer-editable profile, or a client form. After creating the owner through Supabase Auth, grant from a trusted SQL editor/server only:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where email = 'studio-owner@example.com';
```

Sign out/in again after role changes. A customer is redirected away from `/admin`; the admin requires the same claim on both its route guard and database policies.

## 3. Configure email/password and reset links

Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `http://localhost:3000` for local development; change to production URL for live.
- Add Redirect URLs: `http://localhost:3000/**`, your deployed origin wildcard or exact callback URLs, and preview origins you actually use.
- Configure SMTP and email confirmation/redirect templates for production. The login page routes confirmations to `/auth/callback`; password recovery routes to `/auth/reset-password`.
- The app does not ask for email/password again after OAuth. The session remains active across reloads until sign-out/expiry.

## 4. Google OAuth setup

1. Google Cloud Console → create/select a project → APIs & Services → OAuth consent screen; set app name, support email, audience, and authorized domains. Publish or add test users as appropriate.
2. Create an OAuth Client ID with application type **Web application**.
3. In Supabase Dashboard → Authentication → Providers → Google, enable Google and copy Supabase's **Callback URL** (usually `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`).
4. Back in Google Cloud, add that exact Supabase URL under **Authorized redirect URIs**. Add your production site and local origins under **Authorized JavaScript origins** if requested.
5. Copy Google **Client ID** and **Client Secret** into the Supabase Google provider settings, save, and do not add either credential to this source repository or frontend environment.
6. In Supabase URL Configuration allow `http://localhost:3000/auth/callback`, `https://your-domain.example/auth/callback`, and approved preview callbacks.
7. Restart `npm run dev`, click **Continue with Google**, and confirm Google returns through Supabase and ends at `/account` (or a safe internal `next` URL).

## 5. Enable Apple Sign In later

The provider argument already supports `'apple'` in `components/auth-pages.tsx`, the PKCE callback/session exchange is provider-agnostic, and the branded Apple button is shown disabled as “Coming soon”. When ready:

1. Enroll in Apple Developer Program. Create a Sign in with Apple App ID, Services ID for the website, and a Sign in with Apple key; configure the primary App ID, domain/return URL validation, and the Supabase callback URL.
2. Configure the Apple provider under Supabase Auth → Providers → Apple using the Services ID, Team ID, Key ID and private key. Apple signing keys are secrets; keep them in Supabase/server configuration, never client code.
3. Add your deployed domain to Apple and Supabase Auth URL allowlists; test redirect/callback and account-linking behavior.
4. In `components/auth-pages.tsx`, enable the Apple button, call `oauth('apple')`, and remove the disabled/“Coming soon” state. Apple integration requires Apple Developer credentials and provider configuration.

## 6. Order and appointment behavior

- Live checkout requires a signed-in customer and keeps the cart in local storage during the redirect. `place_store_order` binds `auth.uid()` on the server, derives catalog prices and stock from database rows, and creates a pending-payment order. No payment processor is connected; it never claims money was collected.
- PC appointment inserts bind both compatibility `customer_id` and canonical `user_id` to the authenticated user and remain **Pending Approval** until an administrator acts.
- If the browser client is absent, existing product demo browsing remains available, but there are no secure, persistent customer accounts/orders/appointments.

## 7. Manual acceptance checklist (requires your configured Supabase project)

- [ ] Create a customer with email/password; confirm email if enabled; verify `/auth/callback` then `/account`.
- [ ] Sign in with password; refresh and verify session persistence; sign out and verify `/account` redirects to `/auth/login`.
- [ ] Request password reset and complete update using `/auth/reset-password`.
- [ ] Configure Google as above; test OAuth callback and account redirect.
- [ ] Open `/admin` as a customer (must return to `/account`); assign trusted app_metadata admin and verify `/admin`.
- [ ] Create address/favorite/profile/avatar under customer A; confirm customer B cannot read, update, delete, or sign a URL for them.
- [ ] Place a real catalog order while signed in; verify order/items/timeline appear only in that account. Verify stock and price are DB-derived.
- [ ] Request a PC appointment; verify `user_id` equals the submitting auth UID and the status remains Pending Approval.
- [ ] Accept a PC appointment as admin; verify only then does a PC build record appear in the customer's tracker.
- [ ] Read another customer's orders, appointments, quotes, profiles, addresses, favorites, builds and status events with the customer JWT; each should return no rows / permission denied.

No Supabase URL, credentials, OAuth credentials, email inbox, or payment provider are supplied in this checkout, so remote signup/OAuth/production DB acceptance tests cannot be executed here. Run `npm run typecheck` and `npm run build` for local validation once the integration is complete.
