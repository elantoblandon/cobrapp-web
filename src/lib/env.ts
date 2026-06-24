export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32) {
      throw new Error("AUTH_SECRET must be set to at least 32 characters.");
    }

    return secret;
  }

  return secret ?? "desarrollo-cobrapp-cambia-este-secreto";
}
