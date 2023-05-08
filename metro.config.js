/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('js', 'jsx', 'json', 'ts', 'tsx', 'cjs');
config.resolver.assetExts.push(
	'obj',
	'dae',
	'scn',
	'zip',
	'png',
	'svg',
	'jpg',
	'glb',
	'gltf',
	'fbx',
	'lib',
	'mtl',
	'bin',
	'tif',
	'xpng',
	'xjpg',
	'xjpeg',
);
config.transformer.getTransformOptions = async () => ({
	transform: {
		experimentalImportSupport: false,
		inlineRequires: true,
	},
});

module.exports = config;
