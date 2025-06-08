import { useEffect } from 'react'
import { create } from '@nlxai/touchpoint-ui'
import MeetingConfirmationCard from './custom-components/MeetingConfirmationCard'
import ConfirmationCodeComponent from './custom-components/ConfirmationCodeComponent'
import InfoConfirmationComponent from './custom-components/InfoConfirmationComponent'
import ConfirmPhoneNumberComponent from './custom-components/ConfirmPhoneNumberComponent'
import ProductComponent from "./custom-components/ProductComponent"
import CameraAccessComponent from "./custom-components/CameraAccessComponent"
import PongGameComponent from "./custom-components/PongGameComponent"
import NlxLoaderComponent from './NlxLoaderComponent';
import { createFluidBlob } from "./siri-blob"

export default function ChatWidget() {
  useEffect(() => {
    const initializeWidget = async () => {
      try {
        const touchpoint = await create({
          config: {
            applicationUrl: "https://bots.dev.studio.nlx.ai/c/G0iwvOqW4LUWHvi1F6VUB/k4J0i1569sPgYF92LSopc",
            headers: {
              "nlx-api-key": "EkqbsL2n5xHDPpgNdtIRH=H4--XkpDtF",
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
            MeetingConfirmationCard: MeetingConfirmationCard,
            ConfirmationCode: ConfirmationCodeComponent,
            InfoConfirmation: InfoConfirmationComponent,
            ConfirmPhoneNumber: ConfirmPhoneNumberComponent,
            ProductSelection: ProductComponent,
            CameraAccess: CameraAccessComponent,
            PongGame: PongGameComponent,
            NlxLoader: NlxLoaderComponent

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
