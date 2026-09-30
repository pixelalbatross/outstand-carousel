const defaultConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...defaultConfig,
	{
		// WordPress provides these packages at runtime as script dependencies.
		settings: {
			'import/core-modules': [
				'@wordpress/api-fetch',
				'@wordpress/block-editor',
				'@wordpress/blocks',
				'@wordpress/components',
				'@wordpress/core-data',
				'@wordpress/data',
				'@wordpress/dom',
				'@wordpress/element',
				'@wordpress/i18n',
				'@wordpress/interactivity',
				'@wordpress/notices',
			],
		},
	},
];
