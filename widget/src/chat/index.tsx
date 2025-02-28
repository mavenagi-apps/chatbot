import { createRef, render } from "preact";
import { forwardRef, useImperativeHandle } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

export const useMediaQuery = (query: string) => {
  const mediaMatch = window.matchMedia(query);
  const [matches, setMatches] = useState(mediaMatch.matches);

  useEffect(() => {
    const handler: Parameters<
      typeof mediaMatch.addEventListener<"change">
    >[1] = (e) => setMatches(e.matches);
    mediaMatch.addEventListener("change", handler);
    return () => mediaMatch.removeEventListener("change", handler);
  });
  return matches;
};
type XPosition = "left" | "right";
type YPosition = "bottom";
type ChatButtonPosition = `${YPosition}-${XPosition}`;
const defaultChatButtonPosition: ChatButtonPosition = "bottom-right";

const ChatButton = (props: {
  bgColor: string;
  textColor: string;
  isOpen: boolean;
  onClick: () => void;
  location: ChatButtonPosition;
}) => {
  const location =
    props.location === "bottom-left" ? { left: "1rem" } : { right: "1rem" };
  return (
    <div
      style={{
        zIndex: 1000,
        paddingLeft: "0.75rem",
        paddingRight: "0.75rem",
        height: "3rem",
        width: "fit-content",
        position: "fixed",
        ...location,
        bottom: "1rem",
        borderRadius: "9999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "rgba(0, 0, 0, 0.25) 0px 6px 10px 0px",
        backgroundColor: props.bgColor,
        color: props.textColor,
        "-webkit-touch-callout": "none",
        "-webkit-user-select": "none",
        "-khtml-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        userSelect: "none",
      }}
      onClick={props.onClick}
    >
      {!props.isOpen ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg
            style={{
              width: "1.5rem",
              height: "1.5rem",
            }}
            aria-hidden="true"
            xmlnsXlink="http://www.w3.org/2000/xmlns/"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm0 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm1-5.034V12a1 1 0 0 1-2 0v-1.418a1 1 0 0 1 1.038-.999 1.436 1.436 0 0 0 1.488-1.441 1.501 1.501 0 1 0-3-.116.986.986 0 0 1-1.037.961 1 1 0 0 1-.96-1.037A3.5 3.5 0 1 1 11 11.466Z" />
          </svg>
          <span style={{ marginLeft: "0.5rem", marginRight: "0.25rem" }}>
            Get Help
          </span>
        </div>
      ) : (
        <div style={{ display: "flex" }}>
          <svg
            style={{
              width: "1.5rem",
              height: "1.5rem",
            }}
            aria-hidden="true"
            xmlnsXlink="http://www.w3.org/2000/xmlns/"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
          </svg>
        </div>
      )}
    </div>
  );
};

type Props = {
  iframeUrl: string;
  bgColor: string;
  textColor: string;
  location: ChatButtonPosition;
};
const App = forwardRef<
  {
    open: () => void;
    close: () => void;
  },
  Props
>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  useImperativeHandle(ref, () => {
    return {
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    };
  });

  const isWide = useMediaQuery("(min-width: 500px)");
  const location =
    props.location === "bottom-left"
      ? { left: isWide ? "1rem" : 0 }
      : { right: isWide ? "1rem" : 0 };
  const transformOrigin = props.location.replace("-", " ");
  return (
    <>
      <ChatButton
        bgColor={props.bgColor}
        textColor={props.textColor}
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        location={props.location}
      />
      <iframe
        style={{
          backgroundColor: "white",
          width: isWide ? "480px" : "100vw",
          height: isWide ? "560px" : "calc(100vh - 5rem)",
          position: "fixed",
          zIndex: 1000,
          bottom: "5rem",
          ...location,
          border: "solid rgb(209, 213, 219)",
          outline: "none",
          boxShadow: "rgba(0, 0, 0, 0.15) 0px 0px 20px 0px",
          borderRadius: isWide ? "12px" : 0,
          transition:
            "transform 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, opacity 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, box-shadow 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s",
          transformOrigin: transformOrigin,
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0)",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        src={props.iframeUrl}
        allow="clipboard-write"
      />
    </>
  );
});

const appRef = createRef();

export function open() {
  appRef.current?.open();
}

export function close() {
  appRef.current?.close();
}

export async function load({
  organizationId,
  agentId,
  envPrefix,
  bgColor,
  textColor = "white",
  location = defaultChatButtonPosition,
  tag,
  locale,
}: Partial<Omit<Props, "baseUrl">> & {
  envPrefix?: string;
  organizationId: string;
  agentId: string;
  tag?: string;
  locale?: string;
}) {
  const placeholder = document.createElement("div");
  document.body.appendChild(placeholder);

  let appId = "chatbot";
  if (envPrefix?.endsWith(".sb.")) {
    appId = `${envPrefix.substring(0, envPrefix.indexOf("."))}-chatbot`;
    envPrefix = "sandbox.";
  }
  render(
    <App
      ref={appRef}
      iframeUrl={`https://${appId}.${envPrefix ?? ""}onmaven.app/${locale ?? "en"}/${organizationId}/${agentId}?${new URLSearchParams(
        {
          ...(tag ? { tag } : {}),
        },
      )}`}
      bgColor={bgColor || "#6C2BD9"}
      textColor={textColor}
      location={location}
    />,
    document.body,
    placeholder,
  );
}
