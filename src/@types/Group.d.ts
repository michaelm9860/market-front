import { Post } from "./Post";

export type Group = {
    id: number;
    name: string;
    description: string;
    groupAdminsIds: number[];
    groupMembersIds: number[];
    pendingMembersIds: number[];
    image: string;
    groupPosts: Post[];
    createdAt: string;
    private: boolean;
};