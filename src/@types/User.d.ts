import { Post } from "./Post";
import { Role } from "./Role";

export type User = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture: string;
    phoneNumber: string;
    location: string;
    createdAt: string;
    posts: Post[];
    savedPostsIds: number[];
    groupIds: number[];
    groupsUserIsAdminOf: number[];
    groupsUserIsPendingIn: number[];
    roles: Role[];
};