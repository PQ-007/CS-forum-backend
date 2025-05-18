import { Card, List, Typography, Space, Divider, Tag } from 'antd';
import React from 'react';

const { Title, Text } = Typography;

const announcements = [
  {
    title: '中間試験スケジュール',
    date: 'May 19, 2025',
    description: '中間試験のスケジュールが公開されました。詳細は学生ポータルで確認してください。',
  },
  {
    title: 'キャンパスイベント：キャリアフェア',
    date: 'May 15, 2025',
    description: '2025年5月25日にメインホールで開催される年次キャリアフェアにご参加ください。',
  },
  {
    title: '図書館開館時間の更新',
    date: 'May 10, 2025',
    description: '期末試験週間の図書館開館時間が延長され、夜10時まで開館します。',
  },
];

const StudentAnnouncementPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(90deg, #e6f7ff 0%, #f0f2f5 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '40px 24px',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '24px' }}>
          
          <Title level={2} style={{ color: '#1f1f1f', margin: 0 }}>
            学生向けお知らせ
          </Title>
          <Text type="secondary">最新情報をチェック</Text>
        </header>
        <Card
          title={<Title level={4} style={{ margin: 0 }}>最新のお知らせ</Title>}
          style={{
            borderRadius: '12px',
            backgroundColor: '#fff',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          styles={{
            body: { padding: '24px' },
          }}
          hoverable
        >
          <List
            itemLayout="vertical"
            dataSource={announcements}
            renderItem={(item) => (
              <List.Item key={item.title}>
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong style={{ fontSize: '18px', color: '#1f1f1f' }}>
                        {item.title}
                      </Text>
                      <Tag color="blue">{item.date}</Tag>
                    </Space>
                  }
                  description={<Text style={{ color: '#595959' }}>{item.description}</Text>}
                />
                <Divider style={{ margin: '12px 0' }} />
              </List.Item>
            )}
          />
        </Card>
        
      </Space>
    </div>
  );
};

export default StudentAnnouncementPage;