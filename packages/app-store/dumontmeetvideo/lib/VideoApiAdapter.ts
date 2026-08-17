import type { VideoApiAdapter, VideoCallData } from "@calcom/types/VideoApiAdapter";

import getAppKeysFromSlug from "../../_utils/getAppKeysFromSlug";
import { metadata } from "../_metadata";

/**
 * Dumont Meet runs with ALLOW_UNREGISTERED_ROOMS=False, so unlike the Jitsi
 * adapter we cannot invent a slug and hand it out: the room has to exist first.
 * Every booking therefore costs two calls to Meet's external API, a delegated
 * client-credentials token and a room create.
 *
 * Reference implementation of the same handshake: /opt/chat/meet-slash/app.py
 * on airbase-hel1, which backs the Dumont Chat /meet slash command.
 */

// Cloudflare fronts meet.getdumont.ai and 403s clients that send no user agent,
// which is what fetch does server-side. Verified against the same WAF rule that
// blocks the default Python-urllib agent.
const USER_AGENT = "dumont-calendar/1.0";

const DEFAULT_BASE_URL = "https://meet.getdumont.ai";

type DumontMeetAppKeys = {
  baseUrl?: string;
  clientId?: string;
  clientSecret?: string;
  delegatedEmail?: string;
};

async function postJson<T>(url: string, body: unknown, bearer?: string): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // Surface the body: Meet answers "User not found." when delegatedEmail has
    // no Meet user, which is otherwise indistinguishable from a bad secret.
    const detail = await response.text();
    throw new Error(`Dumont Meet ${url} responded ${response.status}: ${detail.slice(0, 200)}`);
  }

  return (await response.json()) as T;
}

const DumontMeetVideoApiAdapter = (): VideoApiAdapter => {
  return {
    getAvailability: () => {
      return Promise.resolve([]);
    },

    createMeeting: async (): Promise<VideoCallData> => {
      const appKeys = (await getAppKeysFromSlug(metadata.slug)) as DumontMeetAppKeys;
      const baseUrl = (appKeys.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
      const { clientId, clientSecret, delegatedEmail } = appKeys;

      if (!clientId || !clientSecret || !delegatedEmail) {
        throw new Error(
          "Dumont Meet is missing app keys. Set clientId, clientSecret and delegatedEmail in the Cal.com admin."
        );
      }

      const { access_token: accessToken } = await postJson<{ access_token: string }>(
        `${baseUrl}/external-api/v1.0/application/token/`,
        {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
          // Meet calls this "scope" but it is the identity the room is created
          // for, and it must already exist as a Meet user.
          scope: delegatedEmail,
        }
      );

      // An empty body is deliberate: Meet generates the slug. Passing the event
      // title would put it in a public URL and invite collisions.
      const room = await postJson<{ slug: string; url: string }>(
        `${baseUrl}/external-api/v1.0/rooms/`,
        {},
        accessToken
      );

      return {
        type: metadata.type,
        id: room.slug,
        password: "",
        url: room.url,
      };
    },

    // The application identity only holds the rooms:create scope, and Meet
    // reaps empty rooms on its own, so there is nothing to delete. The URL is
    // immutable once minted, so an update is just an echo. Same shape as the
    // Jitsi adapter.
    deleteMeeting: async (): Promise<void> => {
      return Promise.resolve();
    },

    updateMeeting: (bookingRef): Promise<VideoCallData> => {
      return Promise.resolve({
        type: metadata.type,
        id: bookingRef.meetingId as string,
        password: bookingRef.meetingPassword as string,
        url: bookingRef.meetingUrl as string,
      });
    },
  };
};

export default DumontMeetVideoApiAdapter;
