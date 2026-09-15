import { IdentityProvider } from "@calcom/prisma/enums";

/**
 * Maps NextAuth provider names to IdentityProvider enum values.
 * Includes aliases (e.g., "saml-idp" -> SAML).
 */
export const NEXTAUTH_TO_IDENTITY_PROVIDER: Record<string, IdentityProvider> = {
  "azure-ad": IdentityProvider.AZUREAD,
  google: IdentityProvider.GOOGLE,
  saml: IdentityProvider.SAML,
  "saml-idp": IdentityProvider.SAML,
  // Dumont SSO. Deliberately reuses SAML rather than adding a ZITADEL
  // enum value: the enum records "authenticates through an external IdP
  // rather than a local password", which is exactly true, and a new value
  // would need a Prisma migration that conflicts on every upstream merge.
  zitadel: IdentityProvider.SAML,
  cal: IdentityProvider.CAL,
};

/**
 * Get IdentityProvider enum from NextAuth provider name.
 * Returns null for unknown providers so callers can reject the login gracefully.
 */
export const getIdentityProvider = (nextAuthProvider: string): IdentityProvider | null => {
  return NEXTAUTH_TO_IDENTITY_PROVIDER[nextAuthProvider] ?? null;
};
