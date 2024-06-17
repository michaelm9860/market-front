export type RegisterRequest = {
    email: string;
    password: string;
    phoneNumber: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    location: string;
    profilePictureFile?: FileList;
  };