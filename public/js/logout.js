// Logout handling for EduSign
document.addEventListener('DOMContentLoaded', function() {
    // Find the logout button if it exists
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                // Send logout request to backend API
                const response = await fetch('/api/auth/logout', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                if (response.ok) {
                    // Create a container for the logout message if it doesn't exist
                    let logoutMessage = document.getElementById('logout-message');
                    
                    if (!logoutMessage) {
                        logoutMessage = document.createElement('div');
                        logoutMessage.id = 'logout-message';
                        logoutMessage.classList.add('success-message', 'show');
                        logoutMessage.style.backgroundColor = '#d4edda';
                        logoutMessage.style.color = '#155724';
                        logoutMessage.style.padding = '1rem';
                        logoutMessage.style.borderRadius = '4px';
                        logoutMessage.style.marginBottom = '1rem';
                        logoutMessage.style.textAlign = 'center';
                        
                        // Insert at the top of the main content
                        const mainContent = document.querySelector('main');
                        if (mainContent && mainContent.firstChild) {
                            mainContent.insertBefore(logoutMessage, mainContent.firstChild);
                        } else if (mainContent) {
                            mainContent.appendChild(logoutMessage);
                        }
                    }
                    
                    // Display success message
                    logoutMessage.textContent = 'You have been logged out successfully. Please log in again to continue.';
                    
                    // Redirect to login page after a short delay
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    console.error('Logout failed');
                }
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});