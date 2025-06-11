import { Card, Row, Col, Statistic, Table, DatePicker, Spin } from 'antd';
import { UserOutlined, FileTextOutlined, CameraOutlined, BankOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import './components/style2.less';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { fetchReviews } from '@/models/review';
import { fetchReports, getReportStats } from '@/models/report';
const { RangePicker } = DatePicker;


interface ReviewsByDate {
  date: string;
  approved: number;
  pending: number;
  rejected: number;
  total: number;
}

const AdminDashBoard = () => {
  
  const [reviewsByDate, setReviewsByDate] = useState<ReviewsByDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null]>([
    moment().subtract(7, 'days'),
    moment()
  ]);
  // Fetch dashboard statistics
   const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      let reportStats = { total: 0, pending: 0, resolved: 0 };
      try {
        reportStats = await getReportStats();
      } catch (error) {
        console.warn('Could not fetch report stats:', error);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews by date range
  const fetchReviewsByDate = async (startDate: moment.Moment, endDate: moment.Moment) => {
    try {
      // Fetch reviews for the date range
      const reviewsData = await fetchReviews({ 
        limit: 1000, // Get more data to process by date
        page: 1 
      });

      // Process the data by date (this would ideally be done by the API)
      const dateMap = new Map<string, { approved: number; pending: number; rejected: number; total: number }>();
      
      // Initialize date map
      const start = moment(startDate);
      const end = moment(endDate);
      while (start.isSameOrBefore(end)) {
        dateMap.set(start.format('YYYY-MM-DD'), {
          approved: 0,
          pending: 0,
          rejected: 0,
          total: 0
        });
        start.add(1, 'day');
      }

      // If we have real review data, process it
      if (reviewsData?.reviews?.length > 0) {
        reviewsData.reviews.forEach((review: any) => {
          const reviewDate = moment(review.created_at || review.createdAt).format('YYYY-MM-DD');
          if (dateMap.has(reviewDate)) {
            const dayData = dateMap.get(reviewDate)!;
            switch (review.status) {
              case 'approved':
                dayData.approved++;
                break;
              case 'pending':
                dayData.pending++;
                break;
              case 'rejected':
                dayData.rejected++;
                break;
            }
            dayData.total++;
            dateMap.set(reviewDate, dayData);
          }
        });
      } else {
        // Fallback to mock data if no real data available
        dateMap.forEach((value, key) => {
          const approved = Math.floor(Math.random() * 10);
          const pending = Math.floor(Math.random() * 5);
          const rejected = Math.floor(Math.random() * 3);
          dateMap.set(key, {
            approved,
            pending,
            rejected,
            total: approved + pending + rejected
          });
        });
      }

      // Convert map to array
      const result: ReviewsByDate[] = Array.from(dateMap.entries()).map(([date, data]) => ({
        date,
        ...data
      })).reverse();

      setReviewsByDate(result);
    } catch (error) {
      console.error('Error fetching reviews by date:', error);
      // Fallback to empty data
      setReviewsByDate([]);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    if (dateRange[0] && dateRange[1]) {
      fetchReviewsByDate(dateRange[0], dateRange[1]);
    }
  }, []);

  const handleDateRangeChange = (dates: [moment.Moment | null, moment.Moment | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);
      fetchReviewsByDate(dates[0], dates[1]);
    } else {
      setDateRange([null, null]);
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Đã duyệt',
      dataIndex: 'approved',
      key: 'approved',
      render: (value: number) => (
        <span style={{ color: '#52c41a' }}>
          <CheckCircleOutlined /> {value}
        </span>
      ),
    },
    {
      title: 'Chờ duyệt',
      dataIndex: 'pending',
      key: 'pending',
      render: (value: number) => (
        <span style={{ color: '#faad14' }}>
          <ExclamationCircleOutlined /> {value}
        </span>
      ),
    },
    {
      title: 'Từ chối',
      dataIndex: 'rejected',
      key: 'rejected',
      render: (value: number) => (
        <span style={{ color: '#ff4d4f' }}>
          {value}
        </span>
      ),
    },
    {
      title: 'Tổng cộng',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => <strong>{value}</strong>,
    },
  ];

  if (loading) {
    return (
      <Card bodyStyle={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <div className='home-welcome'>
          <h1 className='title'>DASHBOARD QUẢN TRỊ</h1>
          <h2 className='sub-title'>DIỄN ĐÀN ĐÁNH GIÁ - GAME HUB</h2>
        </div>
      </Card>

      {/* Main Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số tài khoản"
              value={localStorage.getItem('userCount') ? parseInt(localStorage.getItem('userCount')!, 10) : 10}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số bài viết"
              value={parseInt(localStorage.getItem('totalReviews') || '0', 10)}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Số game trong hệ thống"
              value={localStorage.getItem('totalGames') ? parseInt(localStorage.getItem('totalGames')!, 10) : 0}
              prefix={<CameraOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tài khoản đã ban"
              value={(() => {
                try {
                  const reportStatsStr = localStorage.getItem('reportStats');
                  if (reportStatsStr) {
                    const reportStats = JSON.parse(reportStatsStr);
                    return reportStats.banned || 0;
                  }
                  return 0;
                } catch (error) {
                  console.error('Error parsing reportStats:', error);
                  return 0;
                }
              })()}
              prefix={<BankOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Review Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Bài viết đã duyệt"
              value={parseInt(localStorage.getItem('approvedReviews') || '0', 10)}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Bài viết chờ duyệt"
              value={parseInt(localStorage.getItem('pendingReviews') || '0', 10)}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số báo cáo"
              value={(() => {
                try {
                  const reportStatsStr = localStorage.getItem('reportStats');
                  if (reportStatsStr) {
                    const reportStats = JSON.parse(reportStatsStr);
                    return reportStats.total_reports || 0;
                  }
                  return 0;
                } catch (error) {
                  console.error('Error parsing reportStats:', error);
                  return 0;
                }
              })()}
              prefix={<BankOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Report Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12}>
          <Card>
             <Statistic
              title="Báo cáo đang chờ xử lý"
              value={(() => {
                try {
                  const reportStatsStr = localStorage.getItem('reportStats');
                  if (reportStatsStr) {
                    const reportStats = JSON.parse(reportStatsStr);
                    return reportStats.pending || 0;
                  }
                  return 0;
                } catch (error) {
                  console.error('Error parsing reportStats:', error);
                  return 0;
                }
              })()}
              prefix={<BankOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Reviews by Date Table */}
      <Card title="Thống kê bài viết theo ngày" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </div>
        <Table
          columns={columns}
          dataSource={reviewsByDate}
          rowKey="date"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} ngày`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default AdminDashBoard;