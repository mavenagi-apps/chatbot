import backgroundImg from "./bg.jpg";

export const dynamic = "force-static";
export const dynamicParams = true;

export default async function Page({
  params,
}: {
  params: Promise<{
    organizationId: string;
    agentId: string;
  }>;
}) {
  const { organizationId, agentId } = await params;

  const envPrefix =
    !process.env.ENVIRONMENT || process.env.ENVIRONMENT === "production"
      ? ""
      : process.env.ENVIRONMENT === "sandbox"
        ? `${process.env.SANDBOX_USER}.sb.`
        : `${process.env.ENVIRONMENT}.`;

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImg.src})`,
        backgroundSize: "cover",
        height: "100vh",
      }}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: `
  (function () {
    const script = document.createElement('script');
    script.src = '/widget.js';
    script.async = true;
    script.onload = () => {
      Maven.ChatWidget.load({
        envPrefix: "${envPrefix}",
        organizationId: "${organizationId}",
        agentId: "${agentId}",
        tag: "preview"
      });
    };
    document.head.appendChild(script);
  })();`,
        }}
      ></script>
    </div>
  );
}
