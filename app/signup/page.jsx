"use client"
import { useState, useEffect } from "react"
import { Form, Input, Checkbox, Button, message as antdMessage, Radio } from "antd"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import "./page.scss"
import { useSelector, useDispatch } from 'react-redux'
import { signup, googleLogin, facebookLogin, clearError, clearMessage } from '../../store/slices/authSlice'
import GoogleLogin from '../../components/GoogleLogin'
import FacebookLogin from '../../components/FacebookLogin'
import FacebookDebug from '../../components/FacebookDebug'
import SocialLoginTest from '../../components/SocialLoginTest'

export default function SignUpPage() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { loading, error, message: authMessage } = useSelector(state => state.auth)
  
  const [form] = Form.useForm()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [messageApi, contextHolder] = antdMessage.useMessage();

  useEffect(() => {
    if (authMessage) {
      messageApi.success(authMessage)
      dispatch(clearMessage())
      router.push('/verification')
    }
  }, [authMessage, dispatch, router, messageApi])

  useEffect(() => {
    if (error) {
      messageApi.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch, messageApi])

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo)
  }

  const onFinish = async (values) => {
    try {
      await dispatch(signup(values)).unwrap()
    } catch (err) {
      console.error("Signup failed:", err)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      console.log('Signup page handleGoogleLogin called, redirecting to home...');
      // Google login is already handled in the GoogleLogin component
      // This function just handles the success callback
      router.push('/');
    } catch (err) {
      console.error('Error in handleGoogleLogin:', err);
      messageApi.error('Google signup failed');
    }
  }

  const handleFacebookLogin = async (userData) => {
    try {
      // Facebook login is already handled in the FacebookLogin component
      // This function just handles the success callback
      router.push('/');
    } catch (err) {
      messageApi.error('Facebook signup failed');
    }
  }

  return (
    <div className="signup-container-signup">
      {contextHolder}
      {/* <FacebookDebug /> */}
      {/* <SocialLoginTest /> */}
      <div className="image-section">
        <Image
          src="/sign.jpg"
          alt="Colorful group photo"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      <div className="form-section-signup">
        <div className="form-content-signup">
          <h1>Sign Up</h1>
          <p className="subtitle-signup">Sign up for free to access the Social Media World.</p>

          <Form
            form={form}
            name="signup"
            layout="vertical"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true, message: "Please enter your full name" }]}
            >
              <Input placeholder="Your Full Name" />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[{ required: true, type: "email", message: "Please enter a valid email address" }]}
            >
              <Input placeholder="designer@gmail.com" />
            </Form.Item>

            <Form.Item
              label="Gender"
              name="gender"
              rules={[{ required: true, message: "Please select your gender" }]}
            >
              <Radio.Group>
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
                <Radio value="other">Other</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please enter a username" },
                { min: 3, message: "Username must be at least 3 characters" },
                { max: 20, message: "Username must be at most 20 characters" },
                { pattern: /^[a-zA-Z0-9_]+$/, message: "Username can only contain letters, numbers, and underscores" },
              ]}
            >
              <Input placeholder="your_unique_username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
              extra="Use 8 or more characters with a mix of letters, numbers & symbols"
            >
              <Input.Password 
                iconRender={(visible) => (visible ? <Eye size={16} /> : <EyeOff size={16} />)}
              />
            </Form.Item>

            <Form.Item 
              name="terms" 
              valuePropName="checked" 
              rules={[{ 
                validator: (_, value) => 
                  value ? Promise.resolve() : Promise.reject(new Error('You must accept the terms and conditions'))
              }]}
            >
              <Checkbox>
                Agree to our <Link href="/terms" target="_blank" rel="noopener noreferrer">Terms of use</Link> and{" "}
                <Link href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="signup-button-signup"
                loading={loading}
                block
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>

          {/* OR Separator */}
          <div className="or-separator">
            <div className="or-line"></div>
            <span className="or-text">OR</span>
            <div className="or-line"></div>
          </div>

          {/* Social Login Buttons */}
          <div className="social-login-container">
            <div className="social-button-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => messageApi.error('Google signup failed')}
              />
            </div>
            
            <div className="social-button-wrapper">
              <FacebookLogin
                onSuccess={handleFacebookLogin}
                onError={(error) => messageApi.error(error)}
              />
            </div>
          </div>

          <div className="login-link-signup">
            Already have an account? <Link href="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}