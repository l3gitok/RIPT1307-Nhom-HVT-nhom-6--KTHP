import React from 'react';
import { Modal, Descriptions } from 'antd';
import { Game } from '../../services/GameServices';
import dayjs from 'dayjs';

interface GameDetailFormProps {
	visible: boolean;
	game: Game | null;
	onClose: () => void;
}

const GameDetailForm: React.FC<GameDetailFormProps> = ({ visible, game, onClose }) => (
	<Modal visible={visible} title='Chi tiết Game' onCancel={onClose} footer={null} width={700}>
		{game && (
			<Descriptions column={1} bordered>
				<Descriptions.Item label='ID'>{game._id}</Descriptions.Item>
				<Descriptions.Item label='Tên game'>{game.title}</Descriptions.Item>
				<Descriptions.Item label='Mô tả'>{game.description}</Descriptions.Item>
				<Descriptions.Item label='Ảnh bìa'>
					{game.cover_url && <img src={game.cover_url} alt='cover' style={{ width: 120 }} />}
				</Descriptions.Item>
				<Descriptions.Item label='Ngày phát hành'>
					{game.release_date ? dayjs(game.release_date).format('DD/MM/YYYY') : ''}
				</Descriptions.Item>
				<Descriptions.Item label='Thể loại'>{game.genres?.join(', ')}</Descriptions.Item>
				<Descriptions.Item label='Nền tảng'>{game.platforms?.join(', ')}</Descriptions.Item>
				<Descriptions.Item label='Rating'>{game.rating ?? 0}/5</Descriptions.Item>
				<Descriptions.Item label='Metacritic'>{game.metacritic ?? ''}</Descriptions.Item>
				<Descriptions.Item label='ESRB'>{game.esrb_rating ?? ''}</Descriptions.Item>
				<Descriptions.Item label='Developer'>{game.developer?.join(', ')}</Descriptions.Item>
				<Descriptions.Item label='Publisher'>{game.publisher?.join(', ')}</Descriptions.Item>
				<Descriptions.Item label='RAWG ID'>{game.rawg_id ?? ''}</Descriptions.Item>
				<Descriptions.Item label='Slug'>{game.slug ?? ''}</Descriptions.Item>
				<Descriptions.Item label='Duyệt'>{game.approved ? 'Đã duyệt' : 'Chưa duyệt'}</Descriptions.Item>
				<Descriptions.Item label='Ngày tạo'>
					{game.created_at ? dayjs(game.created_at).format('DD/MM/YYYY HH:mm') : ''}
				</Descriptions.Item>
				<Descriptions.Item label='Ngày cập nhật'>
					{game.updated_at ? dayjs(game.updated_at).format('DD/MM/YYYY HH:mm') : ''}
				</Descriptions.Item>
			</Descriptions>
		)}
	</Modal>
);

export default GameDetailForm;
