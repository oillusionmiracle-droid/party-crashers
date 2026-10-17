'use client';
import React,{createContext,useContext,useEffect,useMemo} from 'react';
import {ClerkProvider,useUser,useClerk,useSession} from '@clerk/react';
import {clerkKey,setTokenProvider} from './services';
type Identity={id:string;name:string;avatar:string;email:string};
type AuthState={user:Identity|null;available:boolean;signIn:(kind?:'google'|'email')=>Promise<void>;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthState>({user:null,available:false,signIn:async()=>{throw new Error('Sign-in is not connected yet. Browse first, or personalize this device.')},signOut:async()=>{}});
export function useIdentity(){return useContext(AuthContext)}
function Bridge({children}:{children:React.ReactNode}){
 const {user}=useUser(),clerk=useClerk(),{session}=useSession();
 useEffect(()=>{setTokenProvider(async()=>session?session.getToken():null);return()=>setTokenProvider(async()=>null)},[session]);
 const value=useMemo<AuthState>(()=>({user:user?{id:user.id,name:user.fullName||user.firstName||'Lagos explorer',avatar:user.imageUrl,email:user.primaryEmailAddress?.emailAddress||''}:null,available:true,signIn:async()=>{await clerk.openSignIn({forceRedirectUrl:location.origin+'/#setup/interests'})},signOut:async()=>{await clerk.signOut()}}),[user,clerk]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function IdentityProvider({children,dark}:{children:React.ReactNode;dark:boolean}){return clerkKey?<ClerkProvider publishableKey={clerkKey} appearance={{variables:{colorPrimary:'#f04a24',colorBackground:dark?'#111418':'#f4f0e7',colorForeground:dark?'#f6f7f8':'#0e0e0d',borderRadius:'.75rem'}}}><Bridge>{children}</Bridge></ClerkProvider>:<>{children}</>}
