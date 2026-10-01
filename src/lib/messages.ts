export function sessionMessage(input: {
  origin: string;
  address: string;
  nonce: string;
  issuedAt: string;
  expiration: string;
}) {
  return [
    "Keel wants you to sign in.",
    "",
    `URI: ${input.origin}`,
    `Address: ${input.address}`,
    `Nonce: ${input.nonce}`,
    `Issued at: ${input.issuedAt}`,
    `Expiration: ${input.expiration}`,
    "",
    "This signature does not spend funds or approve a token.",
  ].join("\n");
}
