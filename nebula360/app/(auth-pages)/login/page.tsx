import SignIn from "@/components/auth/signin-button"

const LoginPage = () => {
  return (
    <div className='relative w-svw h-svh flex justify-center items-center'>
        <div id='login-container' className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center'>
            <SignIn />
        </div>
    </div>
  )
}

export default LoginPage;