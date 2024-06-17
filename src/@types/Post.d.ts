export type Post = {
    id: number;
    productName: string;
    description: string;
    pictures: string[];
    price: number;
    originalPrice: number;
    currency: string;
    category: string;
    location: string;
    userId: number;
    createdAt: string;
    contentUpdatedAt: string;
    savedCount: number;
    groupId: number;
};