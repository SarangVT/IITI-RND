import loginpage from "../assets/loginpage.jpg"
import iitiLogo from "../assets/iitilogo.png"
import { apiLink } from "../lib/api"

const Login = () => {
  console.log("THE ACTUAL COMPILED API LINK IS:", apiLink);
  const handleUserLogin = () => {
    window.location.href = `${apiLink}/api/auth/google/redirect`
  }
  const handleAdminLogin = () => {
    window.location.href = `${apiLink}/api/auth/admin/google/redirect`
  }
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${loginpage})` }}
    >
      <div className="bg-white/20 backdrop-blur-lg shadow-lg rounded-3xl p-12 text-center max-w-md w-full space-y-8 border border-white/30">
        <div className="flex items-center justify-center space-x-4">
          <img src={iitiLogo} alt="IIT Indore" className="h-12 w-12" />
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">
            R&D Portal
          </h1>
        </div>

        <p className="text-white text-lg font-medium">
          Login using your institute Google account
        </p>

        <div className="space-y-4 mt-6">
          <button
            onClick={handleUserLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Login as User
          </button>

          <div className="flex items-center justify-center">
            <div className="border-t border-white/40 w-1/3"></div>
            <span className="mx-3 text-white/70 text-sm">or</span>
            <div className="border-t border-white/40 w-1/3"></div>
          </div>

          <button
            onClick={handleAdminLogin}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login