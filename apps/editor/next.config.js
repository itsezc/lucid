const { MasterCSSWebpackPlugin } = require('@master/css.webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	swcMinify: true,
	experimental: {
		appDir: true,
	},
	devIndicators: {
		buildActivity: true,
		buildActivityPosition: 'bottom-right',
	},
	webpack: (config) => {
		config.plugins.push(new MasterCSSWebpackPlugin());

		return config;
	},
};

module.exports = nextConfig;
