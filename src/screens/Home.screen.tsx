import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import * as THREE from 'three';
import { Canvas, CanvasProps } from '@react-three/fiber/native';
import { Text3D } from '@react-three/drei/native';
import gsap from 'gsap';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { ActivityIndicator, Text } from 'react-native-paper';

// TYPES
import type { AppStackScreenProps } from '~router/AppStackNavigator';

// COMPONENTS
import FocusAwareStatusBar from '~components/common/FocusAwareStatusBar';
import Guitar from '~components/3d/Guitar';
import Menu from '~components/3d/Menu';

// STYLES
import {
	CONSTANT_COLOR as CC,
	CONSTANT_SIZE as CS,
	GLOBAL_STYLE as GS,
} from '../assets/ts/styles';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen: React.FC<AppStackScreenProps<'APP_STACK/HOME'>> = ({}) => {
	// DATA
	const MENU_ITEMS = ['Guitars', 'Basses', 'Amps', 'Pedals', 'Others'];
	const SUB_MENU_ITEMS = ['About', 'Support', 'Terms', 'Faqs'];

	// STATES
	const [menuConfig] = React.useState({
		test: false,
		side: 0,
		isClick: false,
		startPosition: 0,
	});
	const [guitarLoaded, setGuitarLoaded] = React.useState(false);
	const [selectedMenuItem, setSelectedMenuItem] = React.useState(0);
	const MENU_ROTATION_DEG = useSharedValue(90);
	const MENU_HEADER_TRANSFORM_X = useSharedValue(0);

	// ANIMATED
	const MENU_ITEMS_ANIMATED_STYLES = useAnimatedStyle(() => {
		return {
			transform: [{ rotateY: -MENU_ROTATION_DEG.value + 'deg' }],
		};
	});
	const MENU_HEADER_ANIMATED_STYLES = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: MENU_HEADER_TRANSFORM_X.value }],
		};
	});

	// REFS
	const groupRef = React.useRef<THREE.Group | null>(null);

	// FUNCTIONS
	const onTouchStart: CanvasProps['onTouchStart'] = _ => {
		menuConfig.isClick = true;
		menuConfig.startPosition = _.nativeEvent.locationX;
	};

	const onTouchEnd: CanvasProps['onTouchEnd'] = _ => {
		menuConfig.isClick = false;
		menuConfig.startPosition = 0;
	};

	const onTouchMove: CanvasProps['onTouchMove'] = event => {
		if (!menuConfig.isClick) {
			return;
		}
		if (
			!menuConfig.side &&
			event.nativeEvent.pageX - menuConfig.startPosition > 30
		) {
			eventHandler();
		}
		if (
			menuConfig.side &&
			event.nativeEvent.pageX - menuConfig.startPosition < -30
		) {
			eventHandler();
		}
		event.stopPropagation();
	};

	const eventHandler = () => {
		if (menuConfig.test) {
			return;
		}
		menuConfig.side = (menuConfig.side + 1) % 2;
		menuConfig.test = true;

		if (groupRef.current?.rotation.y === 0) {
			setTimeout(() => {
				MENU_ROTATION_DEG.value = withTiming(0, {
					duration: 550,
					easing: Easing.bezier(0.5, 0, 0.5, 1),
				});
			}, 300);

			MENU_HEADER_TRANSFORM_X.value = withTiming(CS.WINDOW_WIDTH * 0.75, {
				duration: 850,
				easing: Easing.bezier(0.5, 0, 0.5, 1),
			});
		} else {
			MENU_ROTATION_DEG.value = withTiming(90, {
				duration: 550,
				easing: Easing.bezier(0.5, 0, 0.5, 1),
			});

			MENU_HEADER_TRANSFORM_X.value = withTiming(0, {
				duration: 850,
				easing: Easing.bezier(0.5, 0, 0.5, 1),
			});
		}

		gsap.to(groupRef.current?.rotation ?? {}, {
			duration: 0.85,
			y: groupRef.current?.rotation.y === 0 ? Math.PI / 2 : 0,
			ease: 'power1.inOut',
			onComplete: () => {
				menuConfig.test = false;
				menuConfig.isClick = false;
			},
		});
	};

	return (
		<View style={STYLES.main}>
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
					<Guitar onModelLoaded={() => setGuitarLoaded(true)} />
				</group>
			</Canvas>

			<Animated.View
				style={[
					STYLES.overLay,
					STYLES.menuItemsWrapper,
					MENU_ITEMS_ANIMATED_STYLES,
				]}>
				<View
					style={{
						...STYLES.menuItemsContainer,
						marginBottom: CS.WINDOW_HEIGHT * 0.14,
					}}>
					{MENU_ITEMS.map((item, index) => (
						<TouchableOpacity
							key={index}
							onPress={() => setSelectedMenuItem(index)}>
							<Text
								style={{
									...STYLES.menuItem,
									...(selectedMenuItem === index ? GS.txtDanger : {}),
								}}>
								{item}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<View style={STYLES.menuItemsContainer}>
					{SUB_MENU_ITEMS.map((item, index) => (
						<TouchableOpacity key={index}>
							<Text
								style={{
									...STYLES.subMenuItem,
								}}>
								{item}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</Animated.View>

			<Animated.View style={[STYLES.menuHeader, MENU_HEADER_ANIMATED_STYLES]}>
				<SafeAreaView
					style={{
						...GS.positionRelative,
						...GS.inlinedItems,
						...GS.justifyCenter,
					}}>
					<View style={STYLES.menuHamburger}>
						<TouchableOpacity onPress={eventHandler}>
							<>
								{[...Array(3).keys()].map((_, index) => (
									<View
										key={index}
										style={{
											...STYLES.menuHamburgerItem,
											width: Number(
												index === 2 ? 25 : STYLES.menuHamburgerItem.width,
											),
										}}
									/>
								))}
							</>
						</TouchableOpacity>
					</View>

					<Text style={{ ...GS.txtUpper, ...GS.FF_MontserratSemiBold }}>
						Product Details
					</Text>
				</SafeAreaView>
			</Animated.View>

			{!guitarLoaded && (
				<View
					style={{
						...STYLES.overLay,
						...GS.zIndexFront,
						...GS.bgPrimary,
						...GS.centeredItems,
					}}>
					<Text
						style={{
							...GS.FF_NunitoBold,
							...GS.txtXlg,
							...GS.txtCenter,
						}}>
						<ActivityIndicator size="small" color={CC.danger} />
					</Text>
				</View>
			)}
		</View>
	);
};

// LOCAL STYLES
const STYLES = StyleSheet.create({
	main: {
		...GS.screen,
		backgroundColor: '#ACA598',
	},
	overLay: {
		...GS.positionAbsolute,
		...GS.l0,
		...GS.t0,
		...GS.h100,
		...GS.w100,
	},
	menuItemsWrapper: {
		...GS.h100,
		top: 0,
		width: 30,
		paddingTop: CS.WINDOW_HEIGHT * 0.34,
	},
	menuItemsContainer: {
		paddingLeft: CS.SPACE_XLG * 1.28,
		minWidth: CS.WINDOW_WIDTH * 0.55,
	},
	menuItem: {
		...GS.FF_MontserratBold,
		...GS.mb3,
		...GS.txtUpper,
		fontSize: CS.FONT_SIZE_XLG * 1.25,
	},
	subMenuItem: {
		...GS.FF_MontserratBold,
		...GS.mb3,
		...GS.txtMd,
		...GS.txtUpper,
	},
	menuHeader: {
		...GS.positionAbsolute,
		...GS.t0,
		...GS.w100,
		...GS.pt5,
		paddingLeft: CS.WINDOW_WIDTH * 0.11,
	},
	menuHamburger: { ...GS.positionAbsolute, top: '130%', left: 0 },
	menuHamburgerItem: {
		...GS.mb1,
		backgroundColor: CC.dark,
		height: 4,
		width: 30,
	},
});

export default HomeScreen;
