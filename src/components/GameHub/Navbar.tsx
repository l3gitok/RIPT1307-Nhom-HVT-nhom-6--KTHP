import React from 'react';
import { Button } from 'antd';

export interface NavbarItem {
	label: string;
	key: number;
}

interface NavbarProps {
	navItems: NavbarItem[];
	activeNav: number;
	setActiveNav: (key: number) => void;
	navLinks?: Record<number, string>; // key -> url
}

const Navbar: React.FC<NavbarProps> = ({ navItems, activeNav, setActiveNav, navLinks }) => {
	const handleClick = (key: number) => {
		if (navLinks && navLinks[key]) {
			window.location.href = navLinks[key];
		} else {
			setActiveNav(key);
		}
	};

	return (
		<div
			style={{
				width: '100%',
				background: '#FFFCFE',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				position: 'fixed',
				top: 54,
				left: 0,
				zIndex: 99,
				borderBottom: '1px solid #eee',
				height: 48,
			}}
		>
			{navItems.map((item) => (
				<Button
					key={item.key}
					type='text'
					onClick={() => handleClick(item.key)}
					style={{
						fontSize: 18,
						fontWeight: 400,
						color: '#120C0C',
						background: 'transparent',
						border: 'none',
						margin: '0 32px',
						borderBottom: activeNav === item.key ? '3px solid #120C0C' : '3px solid transparent',
						borderRadius: 0,
						boxShadow: 'none',
						paddingBottom: 0,
						transition: 'border-bottom 0.2s',
						minWidth: 120,
					}}
				>
					{item.label}
				</Button>
			))}
		</div>
	);
};

export default Navbar;
