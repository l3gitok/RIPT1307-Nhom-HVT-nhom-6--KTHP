import { Row, Col, Button, Typography, Image } from 'antd';
import { DislikeOutlined } from '@ant-design/icons';
import React from 'react';

const { Paragraph } = Typography;

interface PostContentProps {
	onCommentClick: () => void;
}

const PostContent: React.FC<PostContentProps> = ({ onCommentClick }) => (
	<>
		<Paragraph
			style={{
				fontSize: '16px',
				fontFamily: "'Inter', Helvetica",
				marginTop: '20px',
			}}
		>
			Copyright Disclaimer, Under Section 107 of the Copyright Act 1976, allowance is made for &apos;fair use&apos; for
			purposes such as criticism, comment, news reporting, teaching, scholarship, and research. Fair use is a use
			permitted by copyright statute that might otherwise be infringing. Non-profit, educational or personal use tips
			the balance in favor of fair use.
		</Paragraph>
		<div
			style={{
				width: '100%',
				height: '300px',
				backgroundColor: '#c03f3f',
				borderRadius: '16px',
				marginTop: '20px',
			}}
		/>
		<Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
			<Col>
				<Button
					size='middle'
					icon={
						<Image
							preview={false}
							width={20}
							height={20}
							src='https://c.animaapp.com/mb36s6z6gMvutO/img/mdi-like.svg'
							alt='Like Icon'
						/>
					}
				>
					10
				</Button>
			</Col>
			<Col>
				<Button size='middle' icon={<DislikeOutlined style={{ fontSize: 20 }} />}>
					2
				</Button>
			</Col>
			<Col>
				<Button
					size='middle'
					icon={
						<Image
							preview={false}
							width={20}
							height={20}
							src='https://c.animaapp.com/mb36s6z6gMvutO/img/icon-park-outline-comment.svg'
							alt='Comment Icon'
						/>
					}
					onClick={onCommentClick}
				>
					11
				</Button>
			</Col>
			<Col>
				<Button
					size='middle'
					icon={
						<Image
							preview={false}
							width={20}
							height={20}
							src='https://c.animaapp.com/mb36s6z6gMvutO/img/material-symbols-share.svg'
							alt='Share Icon'
						/>
					}
				/>
			</Col>
			<Col flex='auto' />
			<Col>
				<Button
					size='middle'
					icon={
						<Image
							preview={false}
							width={20}
							height={20}
							src='https://c.animaapp.com/mb36s6z6gMvutO/img/material-symbols-star.svg'
							alt='Star Icon'
						/>
					}
				>
					4.5/5
				</Button>
			</Col>
		</Row>
	</>
);

export default PostContent;
