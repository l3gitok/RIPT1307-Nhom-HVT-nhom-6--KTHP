import { Modal, Button, Row, Col, Input, List } from 'antd';
import React from 'react';

interface CommentModalProps {
	visible: boolean;
	onCancel: () => void;
	myComment: string;
	setMyComment: (v: string) => void;
	COMMENTS: string[];
}

const CommentModal: React.FC<CommentModalProps> = ({ visible, onCancel, myComment, setMyComment, COMMENTS }) => (
	<Modal
		visible={visible}
		onCancel={onCancel}
		footer={null}
		width={420}
		bodyStyle={{
			background: 'transparent',
			borderRadius: 50,
			padding: 20,
			boxShadow: 'none',
			position: 'relative',
		}}
		style={{ top: 100, background: 'transparent', boxShadow: 'none', padding: 0, borderRadius: 50 }}
		closable={false}
	>
		<Button
			onClick={onCancel}
			style={{
				position: 'absolute',
				top: 8,
				right: 12,
				zIndex: 2,
				background: 'transparent',
				border: 'none',
				fontSize: 22,
			}}
		>
			×
		</Button>
		<div>
			<Row align='middle' gutter={12} style={{ marginBottom: 12, marginTop: 24 }}>
				<Col>
					<div style={{ width: 48, height: 48, background: '#f66', borderRadius: '50%' }} />
				</Col>
				<Col flex='auto'>
					<Input
						style={{ background: '#f6bcbc', border: 'none', borderRadius: 12, height: 32 }}
						placeholder='Hãy nhận xét game của bạn'
						value={myComment}
						onChange={(e) => setMyComment(e.target.value)}
					/>
				</Col>
				{myComment && (
					<Col>
						<Button
							style={{ background: '#f6bcbc', border: 'none', borderRadius: 12 }}
							onClick={() => setMyComment('')}
						>
							Gửi
						</Button>
					</Col>
				)}
			</Row>
			<hr style={{ border: '1px solid #888', margin: '12px 0' }} />
			<List
				dataSource={COMMENTS}
				renderItem={(item) => (
					<List.Item style={{ background: 'none', border: 'none', padding: 0, marginBottom: 12 }}>
						<Row align='middle' gutter={12} style={{ width: '100%' }}>
							<Col>
								<div style={{ width: 48, height: 48, background: '#f66', borderRadius: '50%' }} />
							</Col>
							<Col flex='auto'>
								<div style={{ background: '#f6bcbc', borderRadius: 20, padding: '8px 16px', fontSize: 15 }}>{item}</div>
							</Col>
						</Row>
					</List.Item>
				)}
			/>
		</div>
	</Modal>
);

export default CommentModal;
