"use client";

import * as amplitude from "@amplitude/analytics-browser";
import { createContext, useContext, useEffect } from "react";

type MagiEvent = "chat-ask-click" | "chat-home-view";

type AmplitudeContextType = {
  logEvent: (
    eventName: MagiEvent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventData?: Record<string, any> | undefined,
  ) => void;
};

const AmplitudeContext = createContext<AmplitudeContextType>(
  {} as AmplitudeContextType,
);

export const AmplitudeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useEffect(() => {
    amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, undefined, {
      logLevel: amplitude.Types.LogLevel.Warn,
      defaultTracking: {
        attribution: true,
        fileDownloads: true,
        formInteractions: true,
        pageViews: true,
        sessions: true,
      },
      identityStorage: "localStorage",
    });
  }, []);

  const logEvent = (
    eventName: MagiEvent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    eventData?: Record<string, any> | undefined,
  ) => {
    amplitude.logEvent(eventName, eventData);
  };

  return (
    <AmplitudeContext.Provider value={{ logEvent }}>
      {children}
    </AmplitudeContext.Provider>
  );
};

export const useAmplitude = () => {
  return useContext(AmplitudeContext);
};
