import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

// Presence: what each user broadcasts to others in the room
export type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
  currentPage: number;
};

// Storage: shared persistent state in the room
type Storage = {
  comments: LiveList<Comment>;
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  text: string;
  pageNumber: number;
  createdAt: string;
};

// UserMeta: static info about each user
type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar?: string;
    color: string;
  };
};

type RoomEvent = never;

import { LiveList } from "@liveblocks/client";

export const {
  RoomProvider,
  useMyPresence,
  useOthers,
  useSelf,
  useStorage,
  useMutation,
  useRoom,
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client);
