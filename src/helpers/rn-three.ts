import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import ExpoThree from 'expo-three';
import { resolveAsync } from 'expo-asset-utils';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

// TYPES
export interface ModelPropsInterface {
	name: string;
	type: 'obj' | 'fbx' | 'glb' | 'gltf';
	// eslint-disable-next-line no-undef
	model: NodeRequire | string;
	isometric?: boolean;
	// eslint-disable-next-line no-undef
	textures?: NodeRequire[];
	material?: THREE.Material;
	lights?: {
		[key in 'directional' | 'spot' | 'hemisphere' | 'ambient' | 'point']?: {
			color: THREE.ColorRepresentation;
			intensity?: number;
			position?: { x?: number; y?: number; z?: number };
		};
	};
	scale?: {
		x?: number;
		y?: number;
		z?: number;
	};
	rotation?: {
		x?: number;
		y?: number;
		z?: number;
	};
	position?: {
		x?: number;
		y?: number;
		z?: number;
	};
	animation?: {
		scale?: {
			x?: number;
			y?: number;
			z?: number;
		};
		rotation?: {
			x?: number;
			y?: number;
			z?: number;
		};
		position?: {
			x?: number;
			y?: number;
			z?: number;
		};
	};
}

export const loadFileAsync = async function (props: {
	asset: ModelPropsInterface['model'];
	funcName: string;
}) {
	const { asset, funcName } = props;

	if (!asset) {
		throw new Error(`ExpoTHREE.${funcName}: Cannot parse a null asset`);
	}
	return (await resolveAsync(asset)).localUri ?? null;
};

export const loadFbxAsync = async function (props: {
	asset: ModelPropsInterface['model'];
	onAssetRequested?: string;
}) {
	const { asset, onAssetRequested } = props;

	const uri = await loadFileAsync({
		asset,
		funcName: 'loadFbxAsync',
	});

	if (!uri) {
		return;
	}

	const base64 = await FileSystem.readAsStringAsync(uri, {
		encoding: FileSystem.EncodingType.Base64,
	});
	const arrayBuffer = decode(base64);
	const loader = new FBXLoader();

	return loader.parse(arrayBuffer, onAssetRequested ?? '');
};

export const loadGLTFAsync = async function (props: {
	asset: ModelPropsInterface['model'];
	onAssetRequested?: string;
}) {
	const { asset, onAssetRequested } = props;
	const uri = await loadFileAsync({
		asset,
		funcName: 'loadGLTFAsync',
	});

	if (!uri) {
		return;
	}

	const base64 = await FileSystem.readAsStringAsync(uri, {
		encoding: FileSystem.EncodingType.Base64,
	});
	const arrayBuffer = decode(base64);
	const loader = new GLTFLoader();
	return new Promise((resolve: (param: GLTF) => unknown, reject) => {
		loader.parse(
			arrayBuffer,
			onAssetRequested ?? '',
			result => {
				resolve(result);
			},
			err => {
				reject(err);
			},
		);
	});
};

export const loadModel = async function (item: ModelPropsInterface) {
	const texturesLength = item.textures?.length || 0;
	__DEV__ && console.log(`[loadModel] -> Textures length: ${texturesLength}`);
	const TEXTURES: any[] = [];

	item.textures?.forEach(async asset => {
		const texture = (await ExpoThree.loadTextureAsync({
			asset,
		})) as THREE.Texture;

		if (item.type === 'glb') {
			texture.flipY = false;
		}

		TEXTURES.push({ name: asset?.name || '-', map: texture });
	});

	for (let i = 0; i < texturesLength; i++) {}
	__DEV__ && console.log('[loadModel] -> Textures done loading');

	let obj: THREE.Group | undefined;
	if (item.type === 'obj') {
		obj = await ExpoThree.loadObjAsync({
			asset: item.model,
			mtlAsset: item?.material || undefined,
		});
	} else if (item.type === 'fbx') {
		obj = await loadFbxAsync({ asset: item.model });
	} else if (item.type === 'gltf' || item.type === 'glb') {
		const result = await loadGLTFAsync({ asset: item.model });
		obj = result?.scene;
	}

	if (!obj) {
		return undefined;
	}

	__DEV__ &&
		console.log('[loadModel] -> Model done loading, adding textures now...');

	if (texturesLength > 0) {
		if (texturesLength === 1) {
			obj.traverse(function (object: any) {
				if (object instanceof THREE.Mesh) {
					object.material.map = TEXTURES[0]?.map;
				}
			});
		} else {
			obj.traverse(function (object: any) {
				if (object instanceof THREE.Mesh) {
					const selected = TEXTURES?.find(x => x.name === object.name);
					object.material.map = selected?.map;
				}
			});
		}
	}
	__DEV__ && console.log('[loadModel] -> Textures done applied...');

	if (item.scale) {
		obj.scale.set(
			item?.scale?.x ?? 0,
			item?.scale?.y ?? 0,
			item?.scale?.z ?? 0,
		);
	}
	if (item.position) {
		obj.position.set(
			item.position.x ?? 0,
			item.position.y ?? 0,
			item.position.z ?? 0,
		);
	}
	if (item.rotation) {
		obj.rotation.x = item.rotation.x ?? 0;
		obj.rotation.y = item.rotation.y ?? 0;
		obj.rotation.z = item.rotation.z ?? 0;
	}
	return obj;
};
