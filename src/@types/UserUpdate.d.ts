export type UserUpdate = {
    firstName: string | null;
    lastName: string | null;
    profilePictureFile?: FileList | null;
    location: string | null;
};