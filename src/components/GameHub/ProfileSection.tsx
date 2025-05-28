import { Row, Col, Button, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface ProfileSectionProps {
	name: string;
	tag: string;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ name, tag }) => (
	<>
		<Row gutter={[16, 16]} align='middle'>
			<Col>
				<div
					style={{
						width: '70px',
						height: '70px',
						backgroundColor: '#549fb1',
						borderRadius: '50%',
					}}
				/>
			</Col>
			<Col flex='1'>
				<Text strong style={{ fontSize: '20px', fontFamily: "'Inter', Helvetica" }}>
					{name}
				</Text>
				<br />
				<Text style={{ fontSize: '14px', fontFamily: "'Inter', Helvetica" }}>Người mới</Text>
			</Col>
			<Col>
				<Button
					size='middle'
					style={{
						backgroundColor: '#ef5f34',
						borderRadius: '20px',
						color: 'white',
					}}
				>
					Follow
				</Button>
			</Col>
		</Row>
		<Row style={{ marginTop: '16px' }}>
			<Col>
				<Button
					size='middle'
					style={{
						width: '180px',
						height: '32px',
						backgroundColor: '#ed8e8e',
						borderRadius: '16px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '0 8px',
					}}
				>
					<div
						style={{
							width: '24px',
							height: '24px',
							backgroundColor: '#6a4040',
							borderRadius: '50%',
							marginRight: '8px',
						}}
					/>
					<Text style={{ fontSize: '14px', fontFamily: "'Inter', Helvetica", color: 'inherit' }}>{tag}</Text>
				</Button>
			</Col>
		</Row>
	</>
);

export default ProfileSection;
