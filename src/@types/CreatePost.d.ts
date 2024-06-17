export type CreatePost = {
    productName: string;
    description: string;
    pictures: File[];
    price: number;
    currency: string;
    category: string;
    location: string | null;
};