import { Post } from "./Post";

export type PostsList = {
    totalPosts: number;
    pageNum: number;
    pageSize: number;
    totalPages: number;
    posts: Post[];
    first: boolean;
    last: boolean;
};