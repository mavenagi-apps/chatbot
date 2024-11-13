This Maven App provides a chat widget that can be embedded on a website. It uses [Maven APIs](https://developers.mavenagi.com) to answer questions and provide feedback.

This Chat provides the original Maven UI and experience.
It is being replaced by Chat v2 which has additional features and security.

# Installation

* Install the `chat` app via Agent Designer  
  * Navigate to the Agent Designer [dashboard](https://app.mavenagi.com/dashboard)  
  * Select `Apps` \> `App Directory` \> `Browse & Install`  
  * Install the official `Chat` app (created by Maven AGI)  
  * Provide the required settings, including the logo URL and brand color hex code  

# Deploying the App Via JS Widget

Note: As of 11/14 the widget.js change is not in prod. So this app can be previewed (see below section) but the embed won't work until approx 11/19

1. Include the below javascript to install the chat widget on your website.

```
<script src="https://www.mavenwidgets.net/widget.js" async></script>
```

3. Initialize the widget and provide configuration settings:

```javascript
<script>
addEventListener("load", function () {
  Maven.ChatWidget.load({
    organizationId: "<orgId>",
    agentId: "<agentId>",
    location: "bottom-left",
    tag: "help-center"
  })
});
</script>
```

Your organizationId can be found on the Organization Profile page within Agent Designer.
And your agentId can be found on the Agents page.

## Configuration Options

```typescript
interface WidgetConfig {
  bgColor?: string;                              // Widget background color
  textColor?: string;                            // Widget text color (default: 'white')
  location?: 'bottom-left' | 'bottom-right';     // Widget position (default: 'bottom-right')
  tag?: string;                                  // A tag to be used on all conversations
  organizationId: string;                        // Required: Your organization ID
  agentId: string;                               // Required: Your agent ID
}
```

You can manually open and close the chat widget using the following methods:
`Maven.ChatWidget.open()`
`Maven.ChatWidget.close()`

You can set the location of the chat button on your website using the following values: 'bottom-left' or 'bottom-right'.

## Previewing the widget in fullscreen

Once installed, the app is available at `https://chat.onmaven.app/en/<organizationId>/<agentId>`.

This is the URL that gets iframed when the app is rendered as an embedded widget.
