import React from 'react';
import { history } from 'umi';

const Features: React.FC = () => {
  const handleCreatePost = () => {
    history.push('/create-post');
  };

  return (
    <div className="create-nft">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="section-heading">
              <div className="line-dec"></div>
              <h2>Tạo Bài Đăng Của Bạn &amp; Đăng Tải Lên Cộng Đồng</h2>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="main-button">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleCreatePost();
                }}
              >
                Tạo Bài Đăng Ngay
              </a>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="item first-item">
              <div className="number">
                <h6>1</h6>
              </div>
              <div className="icon">
                <img src="/assets/images/icon-02.png" alt="Setup Account" />
              </div>
              <h4>Set Up Tài Khoản Của Bạn</h4>
              <p>
                Cá tính riêng của người dùng được thể hiện thông qua trang cá nhân và thông tin tài khoản. 
                Hãy đăng kí ngay và bắt đầu tạo không gian cá nhân
              </p>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="item second-item">
              <div className="number">
                <h6>2</h6>
              </div>
              <div className="icon">
                <img src="/assets/images/icon-04.png" alt="Upload Post" />
              </div>
              <h4>Đăng Tải Bài Viết</h4>
              <p>
                Đăng tải bài viết của bạn, thể hiện quan điểm cá nhân, chia sẻ các giá trị tốt đến với cộng đồng, 
                cùng nhau đánh giá các game bạn mong muốn
              </p>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="item">
              <div className="icon">
                <img src="/assets/images/icon-06.png" alt="Explore Rankings" />
              </div>
              <h4>Khám Phá Bảng Xếp Hạng</h4>
              <p>
                Tham khảo ngay những tựa game đang được quan tâm đến từ cộng đồng, chất lượng và đánh giá
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;