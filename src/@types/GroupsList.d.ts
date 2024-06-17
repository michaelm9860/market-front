import { Group } from "../@types/Group";

export type GroupsList = {
    totalGroups: number;
    pageNum: number;
    pageSize: number;
    totalPages: number;
    isFirst: boolean;
    isLast: boolean;
    userGroups: Group[];
};