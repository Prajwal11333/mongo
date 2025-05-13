// Authentication handling for EduSign
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authSubheader = document.getElementById('auth-subheader');
    const authHeader = document.querySelector('.auth-header h1');
    const successMessage = document.getElementById('auth-success-message');

    loginTab.addEventListener('click', function() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        authHeader.textContent = 'Log In to EduSign';
        authSubheader.textContent = 'Welcome back! Please enter your credentials to continue';
        successMessage.classList.remove('show');
        successMessage.textContent = '';
        clearErrors();
    });

    registerTab.addEventListener('click', function() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        authHeader.textContent = 'Create an Account';
        authSubheader.textContent = 'Join EduSign today to streamline your education workflow';
        successMessage.classList.remove('show');
        successMessage.textContent = '';
        clearErrors();
    });

    // Form validation functions
    function showError(inputId, message) {
        const errorElement = document.getElementById(`${inputId}-error`);
        errorElement.textContent = message;
        errorElement.classList.add('show');
        document.getElementById(inputId).classList.add('error');
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('show');
        });

        const inputElements = document.querySelectorAll('input');
        inputElements.forEach(input => {
            input.classList.remove('error');
        });
    }

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePassword(password) {
        return password.length >= 8;
    }

    // Function to show feedback to user
    function showFeedback(message, isError = false) {
        successMessage.textContent = message;
        successMessage.classList.add('show');
        
        if (isError) {
            successMessage.style.backgroundColor = '#f8d7da';
            successMessage.style.color = '#721c24';
        } else {
            successMessage.style.backgroundColor = '#d4edda';
            successMessage.style.color = '#155724';
        }
    }

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        let isValid = true;

        if (!email) {
            showError('login-email', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('login-email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            showError('login-password', 'Password is required');
            isValid = false;
        }

        if (isValid) {
            try {
                // Show loading state
                addLoadingState('login-form');
                
                // Send login request to backend API
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        rememberMe
                    }),
                });

                const data = await response.json();
                
                // Remove loading state
                removeLoadingState('login-form', 'Log In');
                
                if (response.ok) {
                    showFeedback('Login successful! Redirecting...');
                    // Redirect to home page after successful login
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    // Show error message from server
                    showFeedback(data.message, true);
                }
            } catch (error) {
                // Remove loading state
                removeLoadingState('login-form', 'Log In');
                console.error('Login error:', error);
                showFeedback('An error occurred. Please try again.', true);
            }
        }
    });

    // Registration form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearErrors();
        
        const fullName = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const userType = document.querySelector('input[name="userType"]:checked').value;
        const agreeToTerms = document.getElementById('agree-terms').checked;
        
        let isValid = true;

        if (!fullName) {
            showError('register-name', 'Full name is required');
            isValid = false;
        }

        if (!email) {
            showError('register-email', 'Email is required');
            isValid = false;
        } else if (!validateEmail(email)) {
            showError('register-email', 'Please enter a valid email address');
            isValid = false;
        }

        if (!password) {
            showError('register-password', 'Password is required');
            isValid = false;
        } else if (!validatePassword(password)) {
            showError('register-password', 'Password must be at least 8 characters long');
            isValid = false;
        }

        if (!confirmPassword) {
            showError('confirm-password', 'Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirm-password', 'Passwords do not match');
            isValid = false;
        }

        if (!agreeToTerms) {
            showError('terms', 'You must agree to the Terms of Service and Privacy Policy');
            isValid = false;
        }

        if (isValid) {
            try {
                // Show loading state
                addLoadingState('register-form');
                
                // Send registration request to backend API
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fullName,
                        email,
                        password,
                        confirmPassword,
                        userType,
                        agreeToTerms
                    }),
                });

                const data = await response.json();
                
                // Remove loading state
                removeLoadingState('register-form', 'Create Account');
                
                if (response.ok) {
                    showFeedback('Registration successful! Redirecting to home page...');
                    registerForm.reset();
                    
                    // Redirect to home page after successful registration
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    // Show error message from server
                    showFeedback(data.message, true);
                }
            } catch (error) {
                // Remove loading state
                removeLoadingState('register-form', 'Create Account');
                console.error('Registration error:', error);
                showFeedback('An error occurred. Please try again.', true);
            }
        }
    });
    
    // Add form submission indicators
    function addLoadingState(formId) {
        const submitBtn = document.querySelector(`#${formId} button[type="submit"]`);
        submitBtn.innerHTML = '<span class="spinner"></span> Processing...';
        submitBtn.disabled = true;
    }
    
    function removeLoadingState(formId, originalText) {
        const submitBtn = document.querySelector(`#${formId} button[type="submit"]`);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }

    // Social login buttons (these would need additional backend setup)
    const googleLoginBtn = document.getElementById('google-login');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            window.location.href = '/api/auth/google';
        });
    }

    const facebookLoginBtn = document.getElementById('facebook-login');
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', function() {
            window.location.href = '/api/auth/facebook';
        });
    }
});