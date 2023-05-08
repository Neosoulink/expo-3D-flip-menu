import React from 'react';
import { View, ActivityIndicator } from 'react-native';

// COMMONS
import FocusAwareStatusBar from '~components/common/FocusAwareStatusBar';

// STYLES
import { CONSTANT_COLOR as CC, GLOBAL_STYLE as GS } from '~styles';

export default ({}) => (
	<View style={{ ...GS.screen, ...GS.bgPrimary, ...GS.centeredItems }}>
		<FocusAwareStatusBar
			barStyle="dark-content"
			translucent={true}
			backgroundColor="transparent"
		/>

		<ActivityIndicator size="large" color={CC.danger} />
	</View>
);
