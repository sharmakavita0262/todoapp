import Register from "@/components/auth/Register"
import "../auth.css"

export default function RegisterPage() {
  return (
    <>
      <div className="bg-decorative"></div>

      <div className="auth-container">
        <div className="flex justify-center items-center login-full">
          <div className="auth-card">
            <h3 className="auth-title register">Register</h3>
            <p className="auth-subtitle">Create your account to get started</p>
            <Register />
          </div>
        </div>
      </div>
    </>
  )
}
