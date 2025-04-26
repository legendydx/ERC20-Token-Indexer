import React, { useState } from 'react';
import BreadCrumb from '../components/BreadCrumb';
import Meta from '../components/Meta';
import Container from '../components/Container';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Flex,Box, Center } from '@chakra-ui/react';
import { loginUser } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';

const LoginSchema = yup.object({
  email: yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup.string()
    .required("Password is required")
});

const Login = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
   const navigate = useNavigate();
   
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: (values) => {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        dispatch(loginUser(values))
        navigate("/")
        console.log('Form submitted:', values, 'Remember me:', rememberMe);
        setIsSubmitting(false);
      }, 1000);
    },
  });

  // Function to determine field validation state
  const getValidationState = (fieldName) => {
    if (formik.touched[fieldName]) {
      return formik.errors[fieldName] ? 'is-invalid' : 'is-valid';
    }
    return '';
  };

  return (
    <>
    <Box w="100vw">
        <Center>
<Flex alignItems={'center'}  justifyContent="center" flexDirection={'column'}>
                
      <Meta title={"Login"} />
      <BreadCrumb title="Login" />
      <Container class1="">
        <div className="row justify-content-center">
            
          <div className="col-5 col-md-12 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h3 className="text-center mb-4">Login</h3>
                <p className="text-muted text-center mb-4">Access your account to manage your token portfolio</p>

                <form onSubmit={formik.handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <div className="input-group">
                      <input
                        type="email"
                        className={`form-control ${getValidationState('email')}`}
                        id="email"
                        name="email"
                        placeholder="example@domain.com"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <div className="invalid-feedback">
                          {formik.errors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <label htmlFor="password" className="form-label">Password</label>
                      <a href="/forgot-password" className="text-primary small">Forgot Password?</a>
                    </div>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${getValidationState('password')}`}
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <button 
                        className="input-group-text bg-light" 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">
                          {formik.errors.password}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="rememberMe" 
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary py-2" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Logging In...
                        </>
                      ) : (
                        <>
                          <LogIn size={18} className="me-2" />
                          Login
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <p className="mb-0">Don't have an account? <a href="/signup" className="text-primary">Sign up here</a></p>
                </div>

                <div className="mt-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 border-bottom"></div>
                    <span className="mx-3 text-muted">Or login with</span>
                    <div className="flex-grow-1 border-bottom"></div>
                  </div>

                  <div className="mt-3">
  <div className="row gx-2">
    <div className="col-6">
      <button type="button" className="btn btn-outline-secondary py-2 w-100">
        <img src="/api/placeholder/16/16" alt="Google" className="me-2" style={{width: '16px'}} />
        Continue with Google
      </button>
    </div>
    <div className="col-6">
      <button type="button" className="btn btn-outline-dark py-2 w-100">
        <img src="/api/placeholder/16/16" alt="Apple" className="me-2" style={{width: '16px'}} />
        Continue with Apple
      </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <small className="text-muted">Protected by reCAPTCHA and subject to Token Indexer's <a href="/privacy" className="text-decoration-none">Privacy Policy</a> and <a href="/terms" className="text-decoration-none">Terms of Service</a></small>
            </div>
          </div>
        </div>
      </div>
      </div>
      </Container>
            </Flex>
        </Center>
    </Box>
     
    </>

  );
};

export default Login;