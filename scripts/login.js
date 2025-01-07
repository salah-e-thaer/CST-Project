// import { key } from "./signup";
function displayMessage(message) {
  $('#message').text(message);
  $('#message').css({ display: 'block' });
}
$(function () {


  const adminEmail = 'admin@example.com';
  const adminPassword = 'admin123';
  

  const POLLING_INTERVAL = 2000; // Refresh every 2 seconds for approval from admin to solve the lag between user and admin page
  // Polling for reset approval from admin
  function startPollingForResetapproval(email) {
    console.log("Polling started for email:", email);
    const pollingInterval = setInterval(() => {  // Use setInterval for continuous polling
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find((user) => user.email === email);

      if (user && user.resetApproved) {
        clearInterval(pollingInterval);  // Stop polling after approval
        console.log("Reset approved for user:", user);  // Debug log
        alert('Password reset required. Redirecting to reset page...');
        localStorage.setItem('currentResetUser', JSON.stringify(user));
        window.location.href = 'reset-password.html';  // Redirect to reset password page
      } else {
        console.log('Waiting for admin approval.........');
      }
    }, POLLING_INTERVAL);
  }

  $('#login-form').on('submit', function (event) {
    event.preventDefault();

    const email = $('#login-email').val();
    const password = $('#login-password').val();
    if (email == adminEmail && password == adminPassword) {
      window.location.href = 'admindashboard.html';
    } 

    $('body').on('click', function () {
      $('#message').css({ display: 'none' });
    });

    authenticateUser(email, password);
    $('#login-email').val('');
    $('#login-password').val('');
  });

  function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('users'));
    const userFound = users.some((user) => {
      user.resetApproved = user.resetApproved !== undefined ? user.resetApproved : false;

      const key = CryptoJS.SHA256(email + 's33gggggggggggdsgbltevfmdlvmflgfg').toString();
      const bytes = CryptoJS.AES.decrypt(user.encryptedPassword, key);
      const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
      
      if (user.email == email && password== decryptedPassword ) {//&& decryptedPassword == password
        localStorage.setItem('currentUser', JSON.stringify(user));
        const userRole = user.role;
        if (userRole === 'admin') {
          window.location = 'admindashboard.html';
          // Show admin-specific content
        } else if (userRole === 'seller') {
          window.location = 'seller.html';
          // Show seller-specific content
        } else window.location = 'Product_Listing.html';
        // Show customer-specific content
        return true;
      }
      return false
    });
   
    if (!userFound) {
      displayMessage('incorrect email or password ');
      setTimeout(() => {
        let reset = confirm('Do you want to Rest password?');
        if (reset) {
          if (emailExists(email))
          {
          sentRestRequesttoadmin(email);
          }
          else{
            alert("Email does not exist in the system .");
            $('login-email').val('');
            $('login-password').val('');
          }
        }
      }, 500);
    }}
    function emailExists(email) {
      const users = JSON.parse(localStorage.getItem('users'))||[];
      return users.some(user=>user.email==email);
      
    }
    
  function sentRestRequesttoadmin(email) {
    const requestpass = JSON.parse(localStorage.getItem('requestpass')) || [];
    const existingRequest = requestpass.find(request=>request.email==email);
    if (existingRequest)
    {
      alert('You Are Already have a pending reset request');
      return ;
    }
    const requestId = requestpass.length + 1;
    const requestTime = new Date().toLocaleString();
    const newRequest = { id: requestId, email: email, time: requestTime };
    requestpass.push(newRequest);
    localStorage.setItem('requestpass', JSON.stringify(requestpass));
    alert('Reset password Request is sent to admin ');
    startPollingForResetapproval(email);

  }


});
