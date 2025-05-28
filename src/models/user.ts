import { useState } from 'react';
import { message } from 'antd';
import axios from 'axios';

export default function () {
	const [data, setData] = useState<any[]>([]);
	const [visible, setVisible] = useState(false);
	const [isEdit, setIsEdit] = useState(false);
	const [row, setRow] = useState<any>(null);

	const getDataUser = async () => {
		try {
			const token = localStorage.getItem('accessToken');
			const res = await axios.get('https://gamehubapi-test.onrender.com/api/auth/users', {
				headers: {
					Authorization: token ? `Bearer ${token}` : '',
				},
			});
			if (res.data.success) {
				setData(res.data.users);
			}
		} catch (err) {
			message.error('Lỗi khi tải danh sách user');
		}
	};

	return {
		data,
		visible,
		isEdit,
		row,
		setVisible,
		setIsEdit,
		setRow,
		getDataUser,
	};
}