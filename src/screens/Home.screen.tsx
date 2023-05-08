import React from 'react';
import { View } from 'react-native';
import * as THREE from 'three';
import { Canvas, CanvasProps } from '@react-three/fiber/native';
import { Text3D } from '@react-three/drei/native';
import gsap from 'gsap';

// TYPES
import type { AppStackScreenProps } from '~router/AppStackNavigator';

// COMPONENTS
import FocusAwareStatusBar from '~components/common/FocusAwareStatusBar';
// import Guitar from '~components/3d/Guitar';
import Menu from '~components/3d/Menu';

// STYLES
import { GLOBAL_STYLE as GS } from '../assets/ts/styles';

const HomeScreen: React.FC<AppStackScreenProps<'APP_STACK/HOME'>> = ({}) => {
	// DATA
	const groupRef = React.useRef<THREE.Group | null>(null);
	let test = false;
	let side = 0;
	let isClick = false;
	let startPosition = 0;

	// FUNCTIONS
	const onTouchStart: CanvasProps['onTouchStart'] = _ => {
		isClick = true;
		startPosition = _.nativeEvent.locationX;
	};

	const onTouchEnd: CanvasProps['onTouchEnd'] = _ => {
		isClick = false;
		startPosition = 0;
	};

	const onTouchMove: CanvasProps['onTouchMove'] = event => {
		if (!isClick) {
			return;
		}
		if (!side && event.nativeEvent.pageX - startPosition > 30) {
			eventHandler();
		}
		if (side && event.nativeEvent.pageX - startPosition < -30) {
			eventHandler();
		}
		event.stopPropagation();
	};

	const eventHandler = () => {
		if (test) {
			return;
		}
		side = (side + 1) % 2;
		test = true;

		gsap.to(groupRef.current?.rotation ?? {}, {
			duration: 0.85,
			y: groupRef.current?.rotation.y === 0 ? Math.PI / 2 : 0,
			ease: 'power1.inOut',
			onComplete: () => {
				test = false;
				isClick = false;
			},
		});
	};

	return (
		<View style={{ ...GS.screen }}>
			<FocusAwareStatusBar
				translucent={true}
				backgroundColor="transparent"
				barStyle="dark-content"
			/>

			<Canvas
				shadows
				onTouchMove={onTouchMove}
				onTouchStart={onTouchStart}
				onTouchEnd={onTouchEnd}
				flat
				gl={{ antialias: true }}
				camera={{ fov: 60, near: 0.1, far: 200 }}>
				<directionalLight
					color={'#FDF2E3'}
					castShadow
					position={[0, 2.8, 3]}
					intensity={0.8}
				/>
				<group ref={groupRef} rotation-y={0} position={[0, 0, -1]}>
					<ambientLight intensity={0.5} />
					<Menu />

					<Text3D
						font={require('../assets/fonts/Montserrat/Montserrat-ExtraBold.json')}
						position={[-1.1, 1.9, 0.6]}
						rotation-z={-Math.PI / 2}
						size={0.46}
						height={0.2}>
						FENDER
						<meshStandardMaterial color={'#aca597'} />
					</Text3D>

					<Text3D
						font={require('../assets/fonts/Montserrat/Montserrat-Bold.json')}
						position={[-1, -2.1, 1]}
						rotation-z={0}
						size={0.14}
						lineHeight={0.8}
						letterSpacing={-0.001}
						height={0.00001}>
						Fender{'\n'}
						Jim Adkins {'\n'}
						JA-90
						<meshBasicMaterial color={'#0D0906'} />
					</Text3D>
					{/* <Guitar /> */}
				</group>
			</Canvas>
		</View>
	);
};

export default HomeScreen;
