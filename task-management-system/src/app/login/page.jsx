import Login from "@/components/auth/Login"
import "../auth.css"

export default function LoginPage() {
  return (
    <>
      <div className="bg-decorative"></div>

      <div className="auth-container">
        <div className="flex justify-center items-center login-full">
          <div className="auth-card">
            <h3 className="auth-title login">Login</h3>
            <p className="auth-subtitle">Welcome back! Please sign in to your account</p>
            <Login />
          </div>
        </div>
      </div>
    </>
  )
}
