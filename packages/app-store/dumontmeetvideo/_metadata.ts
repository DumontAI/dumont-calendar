import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  name: "Dumont Meet",
  description:
    "Dumont's self-hosted video meetings. Every booking gets its own room on meet.getdumont.ai, and guests join from the link with no account needed.",
  installed: true,
  // getVideoAdapters() derives the directory name by stripping underscores, so
  // this must stay in lockstep with dirName below.
  type: "dumont_meet_video",
  variant: "conferencing",
  categories: ["conferencing"],
  logo: "icon.png",
  publisher: "Dumont",
  url: "https://meet.getdumont.ai",
  slug: "dumont-meet",
  title: "Dumont Meet",
  isGlobal: false,
  email: "support@getdumont.ai",
  appData: {
    location: {
      linkType: "dynamic",
      type: "integrations:dumont_meet_video",
      label: "Dumont Meet",
    },
  },
  dirName: "dumontmeetvideo",
  concurrentMeetings: true,
  isOAuth: false,
} as AppMeta;

export default metadata;
