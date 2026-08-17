import { z } from "zod";

// Credentials live in app keys rather than env vars so they can be rotated from
// the Cal.com admin UI without rebuilding the image.
export const appKeysSchema = z.object({
  baseUrl: z.string().optional(),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  // Must be an existing Dumont Meet user on a domain the application is allowed
  // to delegate, otherwise the token call answers 404 "User not found."
  delegatedEmail: z.string().email(),
});

export const appDataSchema = z.object({});
