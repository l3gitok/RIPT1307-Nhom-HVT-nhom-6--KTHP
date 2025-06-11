import React from 'react';
import { history } from 'umi';

const Header: React.FC = () => {
  const handleNavigation = (path: string) => {
    history.push(path);
  };

  return (
    <header className="header-area header-sticky">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav className="main-nav">
              <a href="#" className="logo" onClick={(e) => e.preventDefault()}>
                <img src="/assets/images/sad.png" alt="GameHub" />
              </a>
              <ul className="nav">
                <li>
                  <a href="#" className="active" onClick={(e) => e.preventDefault()}>
                    Home
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/user/login');
                    }}
                  >
                    Đăng nhập
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/user/register');
                    }}
                  >
                    Đăng ký
                  </a>
                </li>
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/admin/dashboard');
                    }}
                  >
                    Admin
                  </a>
                </li>
              </ul>
              <a className="menu-trigger">
                <span>Menu</span>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;