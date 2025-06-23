'use client';
import React from 'react';
import Sidebar from '@/components/common/Sidebar';
import Footer from '@/components/common/Footer';
import Navbar from '@/components/common/Navbar';
import { usePathname, useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = ({ children }) => {
  const pathname = usePathname();

  return (
    <>
      <div className={'layout-container'}>
        {/* {pathname != '/' && <Sidebar />} */}
        <div
          class={
            pathname == '/'
              ? // ? "layout-page pl-0-important pt-0-important "
                'layout-page p-0'
              : 'layout-page'
          }
        >
          {pathname != '/' && <Navbar />}

          <div class="content-wrapper">
            <div class="container-fluid flex-grow-1 container-p-0 p-0">
              {children}
            </div>
          </div>
         
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default MainLayout;
