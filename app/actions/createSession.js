'use server';
import { createAdminClient } from "@/config/appwrite";
import { cookies } from "next/headers"; 
import checkAuth from "./checkAuth";

async function createSession(previousState, formData) {
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return {
            error: 'Please fill out all fields',
        };
    }

    const { account } = await createAdminClient();

    try {
        const session = await account.createEmailPasswordSession(email, password);

        cookies().set('appwrite-session', session.secret, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: new Date(session.expire),
            path: '/'
        });

        // 🔍 Fetch roles after login
        const auth = await checkAuth();

        return {
            success: true,
            user: auth.user,
            roles: auth.roles, // <- return roles for frontend to use
        };

    } catch (error) {
        console.log('Authentication Error: ', error);
        return {
            error: 'Invalid Credentials',
        };
    }
}

export default createSession;
