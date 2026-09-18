export interface AddUserDetails {
    firstName: string;
    lastName: string;
    middleName: string;
}

export interface LoginDetails {
    username: string;
    password: string;
    confirmPassword: string;
    status: string;
}

export interface AddUserSchema {
    addUserDetails: AddUserDetails;
    createLoginDetails: boolean;
    loginDetails: LoginDetails;
}