import React, { useState } from 'react';
import BreadCrumb from '../components/BreadCrumb';
import Meta from '../components/Meta';
import Container from '../components/Container';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { Flex,Box, Center } from '@chakra-ui/react';
import { registerUser } from '../features/user/userSlice';
import { useNavigate } from 'react-router-dom';

const SignupSchema = yup.object({
  firstname: yup.string().required("First name is required"),
  lastname: yup.string().required("Last name is required"),
  email: yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  mobile: yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits")
    .required("Mobile number is required"),
  password: yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("Password is required")
});

const Signup = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate =  useNavigate();

  const formik = useFormik({
    initialValues: {
      firstname: '',
      lastname: '',
      email: '',
      mobile: '',
      password: '',
    },
    validationSchema: SignupSchema,
    onSubmit: (values) => {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        // Replace with actual registration function
         dispatch(registerUser(values));
         navigate("/login")
        console.log('Form submitted:', values);
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

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return score;
  };

  const passwordStrength = calculatePasswordStrength(formik.values.password);
  
  const getPasswordStrengthClass = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'bg-danger';
    if (passwordStrength <= 3) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <>
  
<Box w="100vw">
  <Center>
<Flex alignItems={'center'}  justifyContent="center" flexDirection={'column'}>

      <Meta title={"Create Account"} />
      <BreadCrumb title="Signup" />
      <Container class1="">


       
        <div className="row justify-content-center">
            <div className="card border-0 shadow-sm">
              <div className="">
                <h3 className="text-center mb-4">Create Account</h3>
                <p className="text-muted text-center mb-4">Please fill in the information below to create your account</p>

                <form onSubmit={formik.handleSubmit} noValidate>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstname" className="form-label">First Name</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${getValidationState('firstname')}`}
                          id="firstname"
                          name="firstname"
                          placeholder="John"
                          value={formik.values.firstname}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.firstname && !formik.errors.firstname && (
                          <span className="input-group-text bg-success text-white border-0">
                            <Check size={16} />
                          </span>
                        )}
                        {formik.touched.firstname && formik.errors.firstname && (
                          <div className="invalid-feedback">
                            {formik.errors.firstname}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastname" className="form-label">Last Name</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${getValidationState('lastname')}`}
                          id="lastname"
                          name="lastname"
                          placeholder="Doe"
                          value={formik.values.lastname}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        {formik.touched.lastname && !formik.errors.lastname && (
                          <span className="input-group-text bg-success text-white border-0">
                            <Check size={16} />
                          </span>
                        )}
                        {formik.touched.lastname && formik.errors.lastname && (
                          <div className="invalid-feedback">
                            {formik.errors.lastname}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

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
                      {formik.touched.email && !formik.errors.email && (
                        <span className="input-group-text bg-success text-white border-0">
                          <Check size={16} />
                        </span>
                      )}
                      {formik.touched.email && formik.errors.email && (
                        <div className="invalid-feedback">
                          {formik.errors.email}
                        </div>
                      )}
                    </div>
                    <small className="text-muted">We'll never share your email with anyone else.</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="mobile" className="form-label">Mobile Number</label>
                    <div className="input-group">
                      <input
                        type="tel"
                        className={`form-control ${getValidationState('mobile')}`}
                        id="mobile"
                        name="mobile"
                        placeholder="1234567890"
                        value={formik.values.mobile}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        maxLength={10}
                      />
                      {formik.touched.mobile && !formik.errors.mobile && (
                        <span className="input-group-text bg-success text-white border-0">
                          <Check size={16} />
                        </span>
                      )}
                      {formik.touched.mobile && formik.errors.mobile && (
                        <div className="invalid-feedback">
                          {formik.errors.mobile}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">Password</label>
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
                    
                    {formik.values.password && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center">
                          <small className="me-2">Password strength:</small>
                          <div className="progress flex-grow-1" style={{ height: "6px" }}>
                            <div 
                              className={`progress-bar ${getPasswordStrengthClass()}`} 
                              role="progressbar" 
                              style={{ width: `${(passwordStrength/5)*100}%` }}
                              aria-valuenow={passwordStrength} 
                              aria-valuemin="0" 
                              aria-valuemax="5">
                            </div>
                          </div>
                          <small className="ms-2">
                            {passwordStrength <= 2 ? "Weak" : 
                             passwordStrength <= 3 ? "Medium" : "Strong"}
                          </small>
                        </div>
                      </div>
                    )}
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
                          Creating Account...
                        </>
                      ) : "Create Account"}
                    </button>
                  </div>
                </form>

                <div className="mt-4 text-center">
                  <p className="mb-0">Already have an account? <a href="/login" className="text-primary">Login here</a></p>
                 
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

export default Signup;