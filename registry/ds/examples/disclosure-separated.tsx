import { GroupIcon, PersonIcon, UploadIcon } from '@/registry/ds/lib/icons';
import {
  Accordion,
  Disclosure,
  DisclosurePanel,
  DisclosureTrigger,
} from '@/registry/ds/ui/disclosure';

export default function DisclosureSeparated() {
  return (
    <Accordion variant="separated" className="w-full max-w-xl">
      <Disclosure id="profile">
        <DisclosureTrigger startIcon={<PersonIcon />} description="About 2 minutes">
          Complete your profile
        </DisclosureTrigger>
        <DisclosurePanel>
          Add your name and a photo so people know who they are working with.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="import">
        <DisclosureTrigger startIcon={<UploadIcon />} description="CSV or vCard">
          Import your contacts
        </DisclosureTrigger>
        <DisclosurePanel>
          Upload a file with one contact per row. Name and email columns are matched automatically;
          anything else can be mapped by hand.
        </DisclosurePanel>
      </Disclosure>
      <Disclosure id="invite">
        <DisclosureTrigger startIcon={<GroupIcon />} description="Optional">
          Invite people
        </DisclosureTrigger>
        <DisclosurePanel>
          Send invitations by email or share a link. You can change what each person can do at any
          time.
        </DisclosurePanel>
      </Disclosure>
    </Accordion>
  );
}
