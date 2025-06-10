import {
  CustomCard,
  CustomCardRow,
  BaseText,
} from "@nlxai/touchpoint-ui";

import type { CustomComponent } from '../custom-component-types';

export interface MeetingConfirmationCardData {
  confirmationMessage?: string;
  topic: string;
  dateTime: string;
  fullName: string;
  email: string;
  addToCalendarLabel?: string;
  addToCalendarChoiceId: string;
}

const MeetingConfirmationCard: CustomComponent<MeetingConfirmationCardData> = ({
  data,
}) => {
  const confirmationMsg = data.confirmationMessage ?? "Meeting Confirmed!";

  return (
    <CustomCard>
      {/* Row 1: Confirmation Message */}
      <CustomCardRow
        left={<BaseText>{confirmationMsg}</BaseText>}
        right={<BaseText>{" "}</BaseText>}
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
      {/* FIX: Corrected property names from data object */}
      <CustomCardRow
        left={<BaseText>Name:</BaseText>}
        right={<BaseText>{data.fullName}</BaseText>}
      />

      {/* Row 5: Customer Email */}
      <CustomCardRow
        left={<BaseText>Email:</BaseText>}
        right={<BaseText>{data.email}</BaseText>}
      />
    </CustomCard>
  );
};

export default MeetingConfirmationCard;