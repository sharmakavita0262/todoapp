'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { axiosClient, getAuth } from '@/helper/helper';
import { deleteCookie } from 'cookies-next';
import { LOGOUT } from '@/helper/routes';
import { toast } from 'react-toastify';

const Navbar = () => {
  let [user, setUser] = React.useState({});

  const pathname = usePathname();
  useEffect(() => {
    setUser(getAuth());
  }, []);

  return (
    <div
        className="buttonFixed"
        id="navbar-collapse"
      >
      {/* Hide logout button on /tasks */}
      
    </div>
  );
};

export default Navbar;
