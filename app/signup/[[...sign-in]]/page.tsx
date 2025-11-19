import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return <>
  
  <div className="flex flex-col items-center justify-center h-screen">
    <h1 className="text-2xl font-bold">Sign up</h1>
    <SignUp />
  </div>
  </>
}