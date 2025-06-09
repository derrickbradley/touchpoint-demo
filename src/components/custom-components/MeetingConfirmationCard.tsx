import {
  Icons,
  CustomCard,
  CustomCardRow,
  BaseText,
  TextButton,
  type CustomModalityComponent,
} from "@nlxai/touchpoint-ui"

/**
 * Data structure for the MeetingConfirmationCard modality.
 */
export interface MeetingConfirmationCardData {
  /** Optional message like "Meeting Confirmed!". Defaults to "Meeting Confirmed!". */
  confirmationMessage?: string
  /** The topic of the meeting. Required. */
  topic: string
  /** The date and time of the meeting, as a string. Required. */
  dateTime: string
  /** Customer's full name. Required. */
  CustomerFullName: string
  /** Customer's email address. Required. */
  CustomerEmail: string
  /** Optional label for the "Add to Calendar" button. Defaults to "Add to Calendar". */
  addToCalendarLabel?: string
  /** The choice ID to send when "Add to Calendar" is clicked. Required. */
  addToCalendarChoiceId: string
  /** Optional name of the icon for the "Add to Calendar" button. Defaults to "Date". */
  addToCalendarIconName?: keyof typeof Icons
  /** Optional type for the TextButton (e.g., "main" or "ghost"). Defaults to "ghost". */
  buttonType?: "main" | "ghost"
}

/**
 * MeetingConfirmationCard component for Touchpoint UI.
 * Displays meeting details and an "Add to Calendar" option.
 */
const MeetingConfirmationCard: CustomModalityComponent<MeetingConfirmationCardData> = ({
  data,
  conversationHandler,
  enabled,
}) => {
  // Provide default values for optional fields
  const confirmationMsg = data.confirmationMessage ?? "Meeting Confirmed!"
  const calendarButtonLabel = data.addToCalendarLabel ?? "Add to Calendar"
  const iconName = data.addToCalendarIconName || "Date"
  const CalendarIconComponent = Icons[iconName] || Icons.Date // Default to Date icon
  const buttonType = data.buttonType ?? "ghost" // Default button type

  return (
    <CustomCard>
      {/* Row 1: Confirmation Message */}
      <CustomCardRow
        left={<BaseText>{confirmationMsg}</BaseText>}
        right={<BaseText></BaseText>} // Empty right side
      />

      {/* Row 2: Meeting Topic */}
      <CustomCardRow 
        left={<BaseText>Topic:</BaseText>} 
        right={<BaseText>{data.topic}</BaseText>} 
      />

      {/* Row 3: Meeting Date & Time */}
      <CustomCardRow 
        left={<BaseText>When:</BaseText>} 
        right={<BaseText>{data.dateTime}</BaseText>} 
      />

      {/* Row 4: Customer Full Name */}
      <CustomCardRow 
        left={<BaseText>Name:</BaseText>} 
        right={<BaseText>{data.fullName}</BaseText>} 
      />

      {/* Row 5: Customer Email */}
      <CustomCardRow 
        left={<BaseText>Email:</BaseText>} 
        right={<BaseText>{data.email}</BaseText>} 
      />

      {/* Action Button: Add to Calendar */}
      {/* 
      <TextButton
        label={calendarButtonLabel}
        Icon={CalendarIconComponent}
        onClick={enabled ? () => conversationHandler.sendChoice(data.addToCalendarChoiceId) : undefined}
        type={buttonType}
      />
      */}
    </CustomCard>
  )
}

export default MeetingConfirmationCard