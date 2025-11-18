import React from 'react';

const DebugCredentials = () => {
  const testLogin = () => {
    const ADMIN_PHONE = "9876543210";
    const ADMIN_PASSWORD = "admin123";
    const USER_PHONE = "9876543211";
    const USER_PASSWORD = "user123";
    
    const testPhone = "9876543211";
    const testPassword = "user123";
    
    console.log("=== CREDENTIAL TEST ===");
    console.log("Test phone:", testPhone);
    console.log("Test password:", testPassword);
    console.log("USER_PHONE:", USER_PHONE);
    console.log("USER_PASSWORD:", USER_PASSWORD);
    console.log("Phone match:", testPhone === USER_PHONE);
    console.log("Password match:", testPassword === USER_PASSWORD);
    console.log("Both match:", testPhone === USER_PHONE && testPassword === USER_PASSWORD);
    
    // Test admin too
    const testAdminPhone = "9876543210";
    const testAdminPassword = "admin123";
    
    console.log("=== ADMIN TEST ===");
    console.log("Admin phone match:", testAdminPhone === ADMIN_PHONE);
    console.log("Admin password match:", testAdminPassword === ADMIN_PASSWORD);
    console.log("Admin both match:", testAdminPhone === ADMIN_PHONE && testAdminPassword === ADMIN_PASSWORD);
  };

  return (
    <div className="p-4 bg-red-100 border border-red-400 rounded">
      <h3>Debug Credentials</h3>
      <button onClick={testLogin} className="bg-blue-500 text-white p-2 rounded">
        Test Credentials in Console
      </button>
      <div className="mt-2 text-sm">
        <p>User: 9876543211 / user123</p>
        <p>Admin: 9876543210 / admin123</p>
      </div>
    </div>
  );
};

export default DebugCredentials;