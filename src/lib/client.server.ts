export function getBaseUrl() {
  return `https://www.${
    process.env.ENVIRONMENT === "production"
      ? ""
      : process.env.ENVIRONMENT === "sandbox"
        ? `${process.env.SANDBOX_USER}.sb.`
        : `${process.env.ENVIRONMENT}.`
  }mavenagi-apis.com`;
}
