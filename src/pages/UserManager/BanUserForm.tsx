import { Form, Input, InputNumber, Select, Button } from 'antd';

export interface BanUserFormValues {
	reason: string;
	description: string;
	ban_duration_days: number;
	ban_type: string;
}

interface BanUserFormProps {
	onFinish: (values: BanUserFormValues) => void;
	loading?: boolean;
}

const BanUserForm: React.FC<BanUserFormProps> = ({ onFinish, loading }) => {
	const [form] = Form.useForm();

	return (
		<Form
			form={form}
			layout='vertical'
			onFinish={onFinish}
			initialValues={{ ban_type: 'direct', ban_duration_days: 30 }}
		>
			<Form.Item label='Lý do' name='reason' rules={[{ required: true, message: 'Vui lòng nhập lý do!' }]}>
				<Input />
			</Form.Item>
			<Form.Item label='Mô tả' name='description' rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
				<Input.TextArea />
			</Form.Item>
			<Form.Item
				label='Số ngày ban'
				name='ban_duration_days'
				rules={[{ required: true, message: 'Vui lòng nhập số ngày!' }]}
			>
				<InputNumber min={1} max={365} style={{ width: '100%' }} />
			</Form.Item>
			<Form.Item label='Kiểu ban' name='ban_type' rules={[{ required: true, message: 'Vui lòng chọn kiểu ban!' }]}>
				<Select>
					<Select.Option value='direct'>Direct</Select.Option>
				</Select>
			</Form.Item>
			<Form.Item>
				<Button type='primary' htmlType='submit' loading={loading}>
					Ban User
				</Button>
			</Form.Item>
		</Form>
	);
};

export default BanUserForm;