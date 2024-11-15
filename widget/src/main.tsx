// Fragment and h are not used, but they are required for JSX to work
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, render } from "preact";

import * as ChatWidget from "./chat";

declare global {
  interface Window {
    Maven: {
      ChatWidget: typeof ChatWidget;
    };
  }
}

window.Maven = window.Maven || {};
window.Maven.ChatWidget = ChatWidget;
