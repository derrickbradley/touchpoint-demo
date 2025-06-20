import { useEffect } from 'react'
import { create } from '@nlxai/touchpoint-ui'
import OrderSummary from "./custom-components/OrderSummary"
import { createFluidBlob } from "./siri-blob"

import { BaseText, TextButton, Icons } from "@nlxai/touchpoint-ui";



const SimpleComponent = ({ data }: { data: any }) => (
  <>
    <BaseText>{data.message}</BaseText>
    <TextButton
      label={data.message}
      Icon={Icons.ArrowForward}
      onClick={() => console.log("Clicked!")}
    />
  </>
);


export default function ChatWidget() {
  useEffect(() => {
    const initializeWidget = async () => {
      try {
        const touchpoint = await create({
          config: {
            applicationUrl: "https://bots.studio.nlx.ai/c/P3hlQW8UOrEo4ond8U80B/ke6U8CX5ObahwgvkbeByr",
            headers: {
              "nlx-api-key": "JQAamYVOMsE1NG0urOrMo3Jq",
            },
            languageCode: "en-US",
            userId: "5a8019a0-8b0c-454f-ac83-98906f7ddac7",
          },
          
          launchIcon: false,

          theme: {
            fontFamily: "Inter, sans-serif",
            accent: "#AECAFF",
          },
          customModalities: {
            SimpleComponent: SimpleComponent,
            OrderSummary: OrderSummary

          },
          colorMode: "dark",
          windowSize: "half",
        })
        createFluidBlob(touchpoint);
        // Store touchpoint instance if you need to control it later
        ;(window as any).touchpointInstance = touchpoint
      } catch (error) {
        console.error("Failed to initialize Touchpoint:", error)
      }
    }

    // Initialize when component mounts
    initializeWidget()

    return () => {
      // Cleanup: teardown the widget when component unmounts
      const touchpoint = (window as any).touchpointInstance
      if (touchpoint?.teardown) {
        touchpoint.teardown()
      }
    }
  }, [])
  return null

}
