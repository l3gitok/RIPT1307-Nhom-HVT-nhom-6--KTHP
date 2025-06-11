import React from 'react';
import { history } from 'umi';

const Banner: React.FC = () => {
  const handleNavigation = (path: string) => {
    history.push(path);
  };

  return (
    <div className="main-banner">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 align-self-center">
            <div className="header-text">
              <h6>GameHub Platform</h6>
              <h2>Trao đổi, tham khảo &amp; <em>Đánh giá</em> Game</h2>
              <p>
                Nơi mà các game thủ, chuyên gia, người dùng đánh giá về các trò chơi đang hot ở thời điểm hiện tại. 
                Giúp người dùng có thể có những góc nhìn tốt về các loại game
              </p>
              <div className="buttons">
                <div className="border-button">
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/admin/dashboard');
                    }}
                  >
                    Khám phá Game-Hub
                  </a>
                </div>
                <div className="main-button">
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation('/user/register');
                    }}
                  >
                    Đăng ký tài khoản
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5 offset-lg-1">
            <div className="owl-banner">
              <div className="owl-carousel owl-theme">
                <div className="item">
                  <img src="/assets/images/banner-01.png" alt="Banner 1" />
                </div>
                <div className="item">
                  <img src="/assets/images/banner-02.png" alt="Banner 2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;