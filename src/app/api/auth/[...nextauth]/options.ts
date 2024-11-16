import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        // The name to display on the sign in form (e.g. "Sign in with...")
        id: "Credentials",
        name: "Credentials",
        // `credentials` is used to generate a form on the sign in page.
        // You can specify which fields should be submitted, by adding keys to the `credentials` object.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
            email: { label: "Email", type: "email" },
            password: { label: "Password", type: "password" }
        },
        async authorize(credentials: any, req): Promise<any> {
            await dbConnect();
            try {
                const user = await UserModel.findOne({ email: credentials.identifier });
                
                // no such user
                if (!user) {
                    throw new Error("Invalid email or password");
                }
                
                // check verified
                if (!user.isVerified) {
                    throw new Error("Please verify your account before signing in");
                }

                // match password
                const checked = await bcrypt.compareSync(credentials.password, user.password);

                // not matched
                if (!checked) {
                    // If you return null then an error will be displayed advising the user to check their details.
                    throw new Error("Invalid email or password");
                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }

                // matched
                return user;
            } catch (error: any) {
                throw new Error(error);
            }
        }
      }) 
    ],
    callbacks: {
        // this is used when useSession() will be used
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.username = token.username;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
            }
            return session
        },
        // this is used after signin, what to send to frontend?
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.username = user.username;
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
            }
            return token
        }
    },
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
}

