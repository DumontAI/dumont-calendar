import process from "node:process";
import type { AppMeta } from "@calcom/types/App";

export const metadata = {
  name: "Video call",
  description:
    "Built-in web video conferencing, powered by Daily.co. Minimalistic and lightweight, with the features a booking needs.",
  installed: !!process.env.DAILY_API_KEY,
  type: "daily_video",
  variant: "conferencing",
  url: "https://daily.co",
  categories: ["conferencing"],
  logo: "icon.svg",
  publisher: "Moveezi",
  category: "conferencing",
  slug: "daily-video",
  title: "Video call",
  isGlobal: true,
  email: "support@moveezi.com",
  appData: {
    location: {
      linkType: "dynamic",
      type: "integrations:daily",
      label: "Video call",
    },
  },
  key: { apikey: process.env.DAILY_API_KEY },
  dirName: "dailyvideo",
  isOAuth: false,
} as AppMeta;

export default metadata;
