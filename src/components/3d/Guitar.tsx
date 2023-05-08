import React from 'react';
import * as THREE from 'three';
import { loadModel } from '~helpers/rn-three';

const Guitar: React.FC<{
	onModelLoaded?: () => unknown;
	onModelNotLoaded?: () => unknown;
}> = ({ onModelLoaded, onModelNotLoaded }) => {
	// STATES
	const [model, setModel] = React.useState<THREE.Group | undefined>();

	// EFFECTS
	React.useEffect(() => {
		(async () => {
			const _MODEL = await loadModel({
				name: 'jim-atkins',
				type: 'glb',
				model: require('../../assets/models/jim-atkins.glb'),
				isometric: false,
				scale: {
					x: 1,
					y: 1,
					z: 1,
				},
				position: {
					x: 0,
					y: 0,
					z: 0,
				},
				animation: {},
			});

			if (_MODEL) {
				setModel(_MODEL);
				_MODEL.traverse(child => {
					child.castShadow = true;
				});
				onModelLoaded && onModelLoaded();

				return;
			}
			onModelNotLoaded && onModelNotLoaded();
		})();

		return () => {};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return model ? (
		<primitive
			castShadow
			object={model}
			position={[0, 0.25, 1.1]}
			scale={0.67}
		/>
	) : (
		<></>
	);
};

export default Guitar;
