'use client'
import { signIn, signOut, useSession } from 'next-auth/react'
import React, { useEffect } from 'react'

function SignIn() {
  const { data: session }  = useSession();
  
  return (
    <>
      { 
        (session) ? 
          <>
            <h2>Signed in as {session?.user.email}</h2>
            <button onClick={() => { signOut() }}>SIGN OUT</button>
          </>
          :
          <>
            <h2>Not Signed In</h2>
            <button className="p-4 rounded-xl" onClick={() => { signIn() }}>SIGN IN</button>
          </>
      }
    </>
  )
}

export default SignIn